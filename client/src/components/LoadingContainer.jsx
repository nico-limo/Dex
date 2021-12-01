import React, { useState, useEffect } from "react";
import { App } from "../containers";
import { getWeb3, getContracts } from "../utils";

const LoadingContainer = () => {
    const [web3, setWeb3] = useState(undefined);
    const [accounts, setAccounts] = useState([]);
    const [contracts, setContracts] = useState(undefined);

    useEffect(() => {
        const init = async () => {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const contracts = await getContracts(web3);
            setWeb3(web3);
            setAccounts(accounts);
            setContracts(contracts);
        };
        init();
    }, []);

    const isReady = () => {
        return (
            typeof web3 !== 'undefined' &&
            typeof contracts !== 'undefined' &&
            accounts.length > 0
        );
    };

    if (!isReady()) return <div>Loading...</div>;

    return <App web3={web3} accounts={accounts} contracts={contracts} />;
};

export default LoadingContainer;
