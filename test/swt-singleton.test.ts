import { expect, test, beforeEach, beforeAll, vi } from 'vitest';
import { SimpleWebTokenSingleton } from '../src/swt-singleton';
import { IssuerNotDefinedException } from '../src/exceptions/issuer-not-defined-exception';
import { SaltsNotDefinedException } from '../src/exceptions/salts-not-defined-exception';
import { IssueContent } from '../src/types';
import {
    InvalidAudienceException,
    InvalidSignatureException,
    TokenExpiredException,
} from '../src/exceptions';
import { IssuerBuilder } from '../src/builders/issuer.builder';

beforeAll(() => {
    const mockDate = new Date(2025, 0, 1);
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
});

beforeEach(() => {
    SimpleWebTokenSingleton.setTestEnvironment(true);
    SimpleWebTokenSingleton.resetInstance();
});

test('getInstance - Instance Of SimpleWebTokenSingleton', () => {
    const issuer = new IssuerBuilder()
        .issuer('teste')
        .audience(['teste'])
        .salts(['salt1', 'salt2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    expect(simpleWebTokenSingleton).toBeInstanceOf(SimpleWebTokenSingleton);
});

test('getInstance - Equal new getInstance', () => {
    const issuer = new IssuerBuilder()
        .issuer('teste')
        .salts(['salt1', 'salt2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    expect(simpleWebTokenSingleton).toEqual(
        SimpleWebTokenSingleton.getInstance(issuer),
    );
});

test('setIssuer', () => {
    const issuer = new IssuerBuilder()
        .issuer('exemple.com.br')
        .salts(['salt1', 'salt2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    expect(simpleWebTokenSingleton.getIssuer()).toEqual('exemple.com.br');
});

test('setSalts', () => {
    const issuer = new IssuerBuilder()
        .issuer('exemple.com.br')
        .salts(['teste1', 'teste2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    expect(() =>
        simpleWebTokenSingleton.issue({ audience: 'teste.com.br' }),
    ).not.toThrow();
});

test('setAudience', () => {
    const issuer = new IssuerBuilder()
        .issuer('exemple.com.br')
        .audience(['maykon.com.br', 'teste.com.br'])
        .salts(['teste1', 'teste2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    // simpleWebTokenSingleton.setAudience(["maykon.com.br", "teste.com.br"]);

    expect(simpleWebTokenSingleton.getAudience()).toEqual([
        'maykon.com.br',
        'teste.com.br',
    ]);
});

test('issue - Issuer must be set before issuing a token', () => {
    expect(() => {
        const issuer = new IssuerBuilder().build();

        const simpleWebTokenSingleton =
            SimpleWebTokenSingleton.getInstance(issuer);

        simpleWebTokenSingleton.issue({ audience: 'teste.com.br' });
    }).toThrowError(IssuerNotDefinedException);
});

test('issue - Salts must be define before issuing a token', () => {
    expect(() => {
        const issuer = new IssuerBuilder()
            .issuer('exemple.com.br')
            .audience(['maykon.com.br', 'teste.com.br'])
            .build();

        const simpleWebTokenSingleton =
            SimpleWebTokenSingleton.getInstance(issuer);

        simpleWebTokenSingleton.issue({ audience: 'teste.com.br' });
    }).toThrowError(SaltsNotDefinedException);
});

test('issue - Tokens are not equal', () => {
    const issuer = new IssuerBuilder()
        .issuer('exemple.com.br')
        .audience(['maykon.com.br', 'teste.com.br'])
        .salts(['salt1', 'salt2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    const content1: IssueContent = { audience: 'teste.com.br' };
    const content2: IssueContent = { audience: 'teste.dev.br' };

    const token1 = simpleWebTokenSingleton.issue(content1);
    const token2 = simpleWebTokenSingleton.issue(content2);

    expect(token1).not.toEqual(token2);
});

test('validate - Invalid Signature', () => {
    const issuer = new IssuerBuilder()
        .issuer('exemple.com.br')
        .audience(['maykon.com.br', 'teste.com.br'])
        .salts(['salt1', 'salt2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    const token = simpleWebTokenSingleton.issue({ audience: 'teste.com.br' });

    token.content.audience = 'teste2.com.br';

    expect(() => simpleWebTokenSingleton.validate(token)).toThrowError(
        InvalidSignatureException,
    );
});

test('validate - Invalid Audience', () => {
    const issuer = new IssuerBuilder()
        .issuer('exemple.com.br')
        .audience(['maykon.com.br'])
        .salts(['salt1', 'salt2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    const token = simpleWebTokenSingleton.issue({ audience: 'teste.com.br' });

    expect(() => simpleWebTokenSingleton.validate(token)).toThrowError(
        InvalidAudienceException,
    );
});

test('validate - SWT Expired', () => {
    const issuer = new IssuerBuilder()
        .issuer('issuer.com.br')
        .audience(['teste.com.br'])
        .salts(['salt1', 'salt2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    const token = simpleWebTokenSingleton.issue({ audience: 'teste.com.br' });

    vi.advanceTimersByTime(3600000);

    expect(() => simpleWebTokenSingleton.validate(token)).toThrowError(
        new TokenExpiredException('SWT Expired!'),
    );
});

test('validate', () => {
    const issuer = new IssuerBuilder()
        .issuer('issuer.com.br')
        .audience(['teste.com.br'])
        .salts(['salt1', 'salt2'])
        .build();

    const simpleWebTokenSingleton = SimpleWebTokenSingleton.getInstance(issuer);

    const token = simpleWebTokenSingleton.issue({
        audience: 'teste.com.br',
        expiresOn: { scale: 'minutes', time: 90 },
    });

    vi.advanceTimersByTime(3600000);

    expect(simpleWebTokenSingleton.validate(token)).toEqual(true);

    expect(token).toBeTypeOf('object');
});

test.todo('generateSignature');
