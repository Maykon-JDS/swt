import {
  InvalidSignatureException,
  InvalidAudienceException,
  TokenExpiredException,
} from './exceptions';
import { IssueContent, SWT, VerifyBypass } from './types';
import { Issuer } from 'builders/issuer';

export class SimpleWebTokenSingleton {

  private static instance?: SimpleWebTokenSingleton;

  private issuer: Issuer;

  private static isTestEnvironment:boolean = false;

  private constructor(issuer: Issuer) {
    this.issuer = issuer;
  }

  static setTestEnvironment(isTestEnvironment:boolean): void {

    SimpleWebTokenSingleton.isTestEnvironment = isTestEnvironment;

  }

  static getInstance(issuer: Issuer): SimpleWebTokenSingleton {
    if (SimpleWebTokenSingleton.instance == null) {

      SimpleWebTokenSingleton.instance = new SimpleWebTokenSingleton(issuer);
    }

    return SimpleWebTokenSingleton.instance;
  }

  static resetInstance(): void {

    if(!SimpleWebTokenSingleton.isTestEnvironment) {
      throw new Error("TODO");
    }

    SimpleWebTokenSingleton.instance = undefined;
  }

  public getIssuer(): string | undefined {
    return this.issuer.getIssuer();
  }

  public getAudience(): string[] {
    return this.issuer.getAudience();
  }

  public issue(content: IssueContent): SWT {
    return this.issuer.issue(content);
  }

  public validate(swt: SWT, bypass: VerifyBypass[] = []): true {
    const contentSignature = this.issuer.generateSignature(swt.content);

    const now = Date.now();

    if (contentSignature != swt.signature) {
      throw new InvalidSignatureException('Invalid Signature!');
    }

    if (
      !this.issuer.getAudience().includes(swt.content.audience) &&
      !bypass.includes('audience')
    ) {
      throw new InvalidAudienceException('Invalid Audience!');
    }

    if (now >= swt.content.expiresOn && !bypass.includes('expiresOn')) {
      throw new TokenExpiredException('SWT Expired!');
    }

    return true;
  }
}
