import React from "react";
import { Dropdown } from "../components";

const Header = ({ user, tokens, contracts, selectToken }) => {
    const formattedTokens = tokens.map((token) => ({
        label: token.ticker,
        value: token,
    }));
    const activeToken = {
        label: user.selectedToken.ticker,
        value: user.selectedToken,
    };
    const { address } = contracts.dex.options;
    return (
        <header id="header" className="card">
            <div className="row">
                <div className="col-sm-3 flex">
                    <Dropdown
                        items={formattedTokens}
                        activeItem={activeToken}
                        onSelect={selectToken}
                    />
                </div>
                <div className="col-sm-9">
                    <h1 className="header-title">
                        Dex -{" "}
                        <span className="contract-address">
                            Contract address:{" "}
                            <span className="address">
                                {address}
                            </span>
                        </span>
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;
