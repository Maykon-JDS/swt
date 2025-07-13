import { Salts } from "types";
import { BuilderInterface } from "./builder.interface";
import { Issuer } from "./issuer";
import { IssuerNotDefinedException } from "../exceptions/issuer-not-defined-exception";
import { SaltsNotDefinedException } from "../exceptions/salts-not-defined-exception";

export class IssuerBuilder implements BuilderInterface<Issuer> {

    private _salts: Salts | undefined;

    private _issuer: string | undefined;

    private _audience: string[] = [];

    public issuer(issuer: string) : IssuerBuilder {
        this._issuer = issuer;
        return this;
    }

    public audience(audience:string[]) : IssuerBuilder {
        this._audience = audience;
        return this;
    }

    public salts(salts: Salts) : IssuerBuilder {
        this._salts = salts;
        return this;
    }

    public build(): Issuer {
        if (this._issuer == null) {
            throw new IssuerNotDefinedException(
                "Issuer must be set before issuing a token."
            );
        }

        if (!this._salts) {
            throw new SaltsNotDefinedException(
                "Salts must be define before issuing a token."
            );
        }

        return new Issuer(this._issuer, this._salts, this._audience);
    }
}
