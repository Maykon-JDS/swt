import { ContentSWT, IssueContent, Salts, SWT } from "types";
import { add } from "date-fns";
import * as crypto from "node:crypto";
import { SaltsNotDefinedException } from "../exceptions/salts-not-defined-exception";
import { IssuerNotDefinedException } from "../exceptions/issuer-not-defined-exception";

export class Issuer {
    private issuer: string;

    private salts: Salts;

    private audience: string[] = [];

    public getAudience(): string[] {
        return this.audience;
    }

    public getIssuer(): string | undefined {
        return this.issuer;
    }

    public constructor(issuer: string, salts: Salts, audience: string[]) {
        this.issuer = issuer;
        this.salts = salts;
        this.audience = audience;
    }

    public issue(content: IssueContent): SWT {
        if (!this.issuer) {
            throw new IssuerNotDefinedException(
                "Issuer must be set before issuing a token."
            );
        }

        const now = new Date();

        const defaultExpiresOn = add(now, { minutes: 15 });

        const contentSWT: ContentSWT = {
            sti: crypto.randomUUID(),
            issuer: this.issuer ?? "",
            audience: content.audience ?? "",
            expiresOn: (content.expiresOn
                ? add(now, {
                      [content.expiresOn.scale]: content.expiresOn.time,
                  })
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

    public generateSignature(content: ContentSWT): string {
        if (!this.salts) {
            throw new SaltsNotDefinedException(
                "Salts must be define before issuing a token."
            );
        }

        const [salt1, salt2]: Salts = this.salts;

        const contentJson = JSON.stringify(content);

        const intermediateHash = crypto
            .createHmac("sha256", salt1)
            .update(contentJson)
            .digest();

        const sign = crypto
            .createHmac("sha256", salt2)
            .update(intermediateHash)
            .digest("base64");

        return sign;
    }
}
