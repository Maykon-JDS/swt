import * as crypto from 'node:crypto';
import { add } from 'date-fns';
import {
  InvalidSignatureException,
  InvalidAudienceException,
  TokenExpiredException,
} from './exceptions';
import { Salts, IssueContent, SWT, ContentSWT, VerifyBypass } from './types';
import { IssuerNotDefinedException } from './exceptions/issuer-not-defined-exception';
import { SaltsNotDefinedException } from './exceptions/salts-not-defined-exception';

export class SimpleWebTokenSingleton {

  private static instance?: SimpleWebTokenSingleton;

  private salts: Salts | undefined;

  private issuer: string | undefined;

  private audience: string[] = [];

  private static isTestEnvironment:boolean = false;

  private constructor() {}

  static setTestEnvironment(isTestEnvironment:boolean): void {

    SimpleWebTokenSingleton.isTestEnvironment = isTestEnvironment;

  }

  static getInstance(): SimpleWebTokenSingleton {
    if (SimpleWebTokenSingleton.instance == null) {

      SimpleWebTokenSingleton.instance = new SimpleWebTokenSingleton();
    }

    return SimpleWebTokenSingleton.instance;
  }

  static resetInstance(): void {

    if(!SimpleWebTokenSingleton.isTestEnvironment) {
      throw new Error("TODO");
    }

    SimpleWebTokenSingleton.instance = undefined;
  }

  public setIssuer(issuer: string): void {
    this.issuer = issuer;
  }

  public getIssuer(): string | undefined {
    return this.issuer;
  }

  public setSalts(salts: Salts): void {
    this.salts = salts;
  }

  public setAudience(audience: string[]): void {
    this.audience = audience;
  }

  public getAudience(): string[] {
    return this.audience;
  }

  public issue(content: IssueContent): SWT {
    if (!this.issuer) {
      throw new IssuerNotDefinedException('Issuer must be set before issuing a token.');
    }

    const now = new Date;

    const defaultExpiresOn = add(now, { minutes: 15 });

    const contentSWT: ContentSWT = {
      sti: crypto.randomUUID(),
      issuer: this.issuer ?? '',
      audience: content.audience ?? '',
      expiresOn: (content.expiresOn
        ? add(now, { [content.expiresOn.scale]: content.expiresOn.time })
        : defaultExpiresOn
      ).getTime(),
      ...content.extras,
    };

    const swt: SWT = {
      content: contentSWT,
      signature: this.generateSignature(contentSWT),
    };

    return swt;
  }

  public validate(swt: SWT, bypass: VerifyBypass[] = []): true {
    const contentSignature = this.generateSignature(swt.content);

    const now = Date.now();

    if (contentSignature != swt.signature) {
      throw new InvalidSignatureException('Invalid Signature!');
    }

    if (
      !this.audience.includes(swt.content.audience) &&
      !bypass.includes('audience')
    ) {
      throw new InvalidAudienceException('Invalid Audience!');
    }

    if (now >= swt.content.expiresOn && !bypass.includes('expiresOn')) {
      throw new TokenExpiredException('SWT Expired!');
    }

    return true;
  }

  private generateSignature(content: ContentSWT): string {

    if (!this.salts) {
      throw new SaltsNotDefinedException('Salts must be define before issuing a token.');
    }

    const [salt1, salt2]: Salts = this.salts;

    const contentJson = JSON.stringify(content);

    const intermediateHash = crypto
      .createHmac('sha256', salt1)
      .update(contentJson)
      .digest();

    const sign = crypto
      .createHmac('sha256', salt2)
      .update(intermediateHash)
      .digest('base64');

    return sign;
  }

}
