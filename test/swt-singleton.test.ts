import { expect, test, beforeEach, beforeAll, afterEach, vi } from 'vitest'
import { SimpleWebTokenSingleton } from '../package/swt-singleton'
import { IssuerNotDefinedException } from '../package/exceptions/issuer-not-defined-exception';
import { SaltsNotDefinedException } from '../package/exceptions/salts-not-defined-exception';
import { IssueContent, SWT } from '../package/types';
import { InvalidAudienceException, InvalidSignatureException, TokenExpiredException } from '../package/exceptions';

beforeAll(() => {

  const mockDate = new Date(2025, 0, 1);
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);

})

beforeEach(() => {

  SimpleWebTokenSingleton.setTestEnvironment(true);
  SimpleWebTokenSingleton.resetInstance();

});

test('getInstance - Instance Of SimpleWebTokenSingleton', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  expect(simpleWebTokenSingleton).toBeInstanceOf(SimpleWebTokenSingleton);

});

test('getInstance - Equal new getInstance', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  expect(simpleWebTokenSingleton).toEqual(SimpleWebTokenSingleton.getInstance());

});

test('setIssuer', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setIssuer("exemple.com.br");

  expect(simpleWebTokenSingleton.getIssuer()).toEqual("exemple.com.br");

});

test('setSalts', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setIssuer("exemple.com.br");

  simpleWebTokenSingleton.setSalts(["teste1", "teste2"]);

  expect(() => simpleWebTokenSingleton.issue({audience: "teste.com.br"})).not.toThrow();

});

test('setAudience', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setAudience(["maykon.com.br", "teste.com.br"]);

  expect(simpleWebTokenSingleton.getAudience()).toEqual(["maykon.com.br", "teste.com.br"]);

});

test('issue - Issuer must be set before issuing a token', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  expect(() => simpleWebTokenSingleton.issue({audience: "teste.com.br"})).toThrowError(IssuerNotDefinedException);

});

test('issue - Salts must be define before issuing a token', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setIssuer("issuer.com.br")

  expect(() => simpleWebTokenSingleton.issue({audience: "teste.com.br"})).toThrowError(SaltsNotDefinedException);

});

test('issue - Tokens are not equal', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setIssuer("issuer.com.br")

  simpleWebTokenSingleton.setSalts(["salt1", "salt2"]);

  const content:IssueContent = {audience: "teste.com.br"};

  const token1 = simpleWebTokenSingleton.issue(content);
  const token2 = simpleWebTokenSingleton.issue(content);

  expect(token1).not.toEqual(token2);

});

test('validate - Invalid Signature', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setIssuer("issuer.com.br")

  simpleWebTokenSingleton.setSalts(["salt1", "salt2"]);

  const token = simpleWebTokenSingleton.issue({audience: "teste.com.br"});

  token.content.audience = "teste2.com.br";

  expect(() => simpleWebTokenSingleton.validate(token)).toThrowError(InvalidSignatureException);

});

test('validate - Invalid Audience', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setIssuer("issuer.com.br")

  simpleWebTokenSingleton.setSalts(["salt1", "salt2"]);

  const token = simpleWebTokenSingleton.issue({audience: "teste.com.br"});

  expect(() => simpleWebTokenSingleton.validate(token)).toThrowError(InvalidAudienceException);

});

test('validate - SWT Expired', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setIssuer("issuer.com.br")

  simpleWebTokenSingleton.setAudience(["teste.com.br"])

  simpleWebTokenSingleton.setSalts(["salt1", "salt2"]);

  const token = simpleWebTokenSingleton.issue({audience: "teste.com.br", });

  vi.advanceTimersByTime(3600000)

  expect(() => simpleWebTokenSingleton.validate(token)).toThrowError(new TokenExpiredException("SWT Expired!"));

});

test('validate', () => {

  const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance();

  simpleWebTokenSingleton.setIssuer("issuer.com.br")

  simpleWebTokenSingleton.setAudience(["teste.com.br"])

  simpleWebTokenSingleton.setSalts(["salt1", "salt2"]);

  const token = simpleWebTokenSingleton.issue({audience: "teste.com.br", expiresOn: {scale:'minutes', time: 90}});

  vi.advanceTimersByTime(3600000)

  expect(simpleWebTokenSingleton.validate(token)).toEqual(true);

  expect(token).toBeTypeOf('object');

});

test.todo("generateSignature");