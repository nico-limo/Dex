const { expectRevert } = require("@openzeppelin/test-helpers");
const Dai = artifacts.require("mocks/Dai.sol");
const Bat = artifacts.require("mocks/Bat.sol");
const Rep = artifacts.require("mocks/Rep.sol");
const Zrx = artifacts.require("mocks/Zrx.sol");
const Dex = artifacts.require("Dex.sol");

const SIDE = { BUY: 0, SELL: 1 }; // To know the type order

contract("Dex", (accounts) => {
    let dai, bat, rep, zrx, dex;
    const [trader1, trader2] = [accounts[1], accounts[2]]; //accounts[0] will be the admin
    const [DAI, BAT, REP, ZRX] = ["DAI", "BAT", "REP", "ZRX"].map((ticker) =>
        web3.utils.fromAscii(ticker)
    );

    // a util to convert a number to wei
    const bigAmount = web3.utils.toWei("1000");
    const douebleRegularAmount = web3.utils.toWei("200");
    const regularAmount = web3.utils.toWei("100");
    const smallAmount = web3.utils.toWei("10");
    const superSmallAmount = web3.utils.toWei("5");

    const expectedBalanceOne = web3.utils.toWei("50");
    const expectedBalanceTwo = web3.utils.toWei("95");
    // token does not exist
    const fakeToken = web3.utils.fromAscii("TOKEN-DOES-NOT-EXIST");

    // error types
    const inputError = "this token does not exist";
    const balanceError = "balance too low";
    const DAIError = "cannot trade DAI";

    beforeEach(async () => {
        [dai, bat, rep, zrx] = await Promise.all([
            Dai.new(),
            Bat.new(),
            Rep.new(),
            Zrx.new(),
        ]);
        dex = await Dex.new();
        await Promise.all([
            dex.addToken(DAI, dai.address),
            dex.addToken(BAT, bat.address),
            dex.addToken(REP, rep.address),
            dex.addToken(ZRX, zrx.address),
        ]);

        const seedTokenBalance = async (token, trader) => {
            await token.faucet(trader, bigAmount);
            await token.approve(dex.address, bigAmount, { from: trader }); // we approve the token in our dex to do tx
        };
        // Load funds to trader1 with the faucet
        await Promise.all(
            [dai, bat, rep, zrx].map((token) =>
                seedTokenBalance(token, trader1)
            )
        );
        // Load funds to trader2 with the faucet
        await Promise.all(
            [dai, bat, rep, zrx].map((token) =>
                seedTokenBalance(token, trader2)
            )
        );
    });

    // DEPOSIT TESTS ---------------------------------------------------------------------------
    it("should deposit tokens", async () => {
        await dex.deposit(regularAmount, DAI, { from: trader1 });
        const balance = await dex.traderBalances(trader1, DAI);
        assert(balance.toString() === regularAmount);
    });

    it("should NOT deposit tokens if token does not exist", async () => {
        await expectRevert(
            dex.deposit(regularAmount, fakeToken, {
                from: trader1,
            }),
            inputError
        );
    });
    // // DEPOSIT TESTS ---------------------------------------------------------------------------

    // // WITHDRAW TESTS ---------------------------------------------------------------------------
    it("should withdraw tokens", async () => {
        await dex.deposit(regularAmount, DAI, { from: trader1 });

        await dex.withdraw(regularAmount, DAI, { from: trader1 });
        const [balanceDex, balanceDai] = await Promise.all([
            dex.traderBalances(trader1, DAI),
            dai.balanceOf(trader1),
        ]);
        assert(balanceDex.isZero());
        assert(balanceDai.toString() === bigAmount);
    });

    it("should NOT withdraw tokens if token does not exist", async () => {
        await expectRevert(
            dex.withdraw(regularAmount, fakeToken, { from: trader1 }),
            inputError
        );
    });

    it("should NOT withdraw tokens if balance is too low", async () => {
        await dex.deposit(regularAmount, DAI, { from: trader1 });

        await expectRevert(
            dex.withdraw(bigAmount, DAI, { from: trader1 }),
            balanceError
        );
    });
    // WITHDRAW TESTS ---------------------------------------------------------------------------

    // CREATE LIMIT ORDER TESTS -------------------------------------------------------------
    it("should create limit order", async () => {
        // Deposit and Created First Order for trader1
        await dex.deposit(regularAmount, DAI, { from: trader1 });
        await dex.createLimitOrder(REP, smallAmount, 10, SIDE.BUY, {
            from: trader1,
        });

        // Check the orders
        let buyOrders = await dex.getOrders(REP, SIDE.BUY);
        let sellOrders = await dex.getOrders(REP, SIDE.SELL);
        assert(sellOrders.length === 0);
        assert(buyOrders.length === 1);
        assert(buyOrders[0].trader === trader1);
        assert(buyOrders[0].ticker === web3.utils.padRight(REP, 64));
        assert(buyOrders[0].price === "10");
        assert(buyOrders[0].amount === smallAmount);

        // Deposit and Created First Order for trader2
        await dex.deposit(douebleRegularAmount, DAI, { from: trader2 });
        await dex.createLimitOrder(REP, smallAmount, 11, SIDE.BUY, {
            from: trader2,
        });

        // Check the orders for second time
        buyOrders = await dex.getOrders(REP, SIDE.BUY);
        sellOrders = await dex.getOrders(REP, SIDE.SELL);
        assert(sellOrders.length === 0);
        assert(buyOrders.length === 2);
        assert(buyOrders[0].trader === trader2);
        assert(buyOrders[1].trader === trader1);

        // Created Second Order for trader2
        await dex.createLimitOrder(REP, smallAmount, 9, SIDE.BUY, {
            from: trader2,
        });

        // Check the orders for third time
        buyOrders = await dex.getOrders(REP, SIDE.BUY);
        sellOrders = await dex.getOrders(REP, SIDE.SELL);
        assert(sellOrders.length === 0);
        assert(buyOrders.length === 3);
        assert(buyOrders[0].trader === trader2);
        assert(buyOrders[1].trader === trader1);
        assert(buyOrders[2].trader === trader2);
        assert(buyOrders[2].price === "9");
    });

    it("Should NOT create limit order if token does not exist", async () => {
        await expectRevert(
            dex.createLimitOrder(fakeToken, bigAmount, 10, SIDE.BUY, {
                from: trader1,
            }),
            inputError
        );
    });

    it("Should NOT create limit order if token does is DAI", async () => {
        await expectRevert(
            dex.createLimitOrder(DAI, bigAmount, 10, SIDE.BUY, {
                from: trader1,
            }),
            DAIError
        );
    });

    it("Should NOT create limit order if token balance is too low", async () => {
        await dex.deposit(regularAmount, REP, { from: trader1 });
        await expectRevert(
            dex.createLimitOrder(REP, douebleRegularAmount, 10, SIDE.SELL, {
                from: trader1,
            }),
            `token ${balanceError}`
        );
    });

    it("should NOT create limit order if dai balance too low", async () => {
        await dex.deposit(regularAmount, DAI, { from: trader1 });
        await expectRevert(
            dex.createLimitOrder(REP, douebleRegularAmount, 200, SIDE.BUY, {
                from: trader1,
            }),
            `dai ${balanceError}`
        );
    });
    // CREATE LIMIT ORDER TESTS -------------------------------------------------------------

    // CREATE MARKET ORDER TESTS -------------------------------------------------------------
    it("should create market order & match against existint limit order", async () => {
        await dex.deposit(regularAmount, DAI, { from: trader1 });
        await dex.createLimitOrder(REP, smallAmount, 10, SIDE.BUY, {
            from: trader1,
        });

        await dex.deposit(regularAmount, REP, { from: trader2 });
        await dex.createMarketOrder(REP, superSmallAmount, SIDE.SELL, {
            from: trader2,
        });

        const balances = await Promise.all([
            dex.traderBalances(trader1, DAI),
            dex.traderBalances(trader1, REP),
            dex.traderBalances(trader2, DAI),
            dex.traderBalances(trader2, REP),
        ]);
        const orders = await dex.getOrders(REP, SIDE.BUY);
        assert(orders[0].filled === superSmallAmount);
        assert(balances[0].toString() === expectedBalanceOne);
        assert(balances[1].toString() === superSmallAmount);
        assert(balances[2].toString() === expectedBalanceOne);
        assert(balances[3].toString() === expectedBalanceTwo);
    });

    it("Should NOT create market order if token does not exist", async () => {
        await expectRevert(
            dex.createMarketOrder(fakeToken, bigAmount, SIDE.BUY, {
                from: trader1,
            }),
            inputError
        );
    });

    it("Should NOT create market order if token does is DAI", async () => {
        await expectRevert(
            dex.createMarketOrder(DAI, bigAmount, SIDE.BUY, {
                from: trader1,
            }),
            DAIError
        );
    });

    it("Should NOT create market order if token balance is too low", async () => {
        await dex.deposit(regularAmount, REP, { from: trader1 });
        await expectRevert(
            dex.createMarketOrder(REP, douebleRegularAmount, SIDE.SELL, {
                from: trader1,
            }),
            `token ${balanceError}`
        );
    });

    it("should NOT create market order if dai balance too low", async () => {
        await dex.deposit(regularAmount, REP, { from: trader1 });
        await dex.createLimitOrder(REP, regularAmount, 10, SIDE.SELL, {
            from: trader1,
        });

        await expectRevert(
            dex.createMarketOrder(REP, regularAmount, SIDE.BUY, {
                from: trader2,
            }),
            `dai ${balanceError}`
        );
    });
    // CREATE MARKET ORDER TESTS -------------------------------------------------------------
});
