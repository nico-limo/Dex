const {expectRevert} = require('@openzeppelin/test-helpers');
const Dai = artifacts.require('mocks/Dai.sol');
const Bat = artifacts.require('mocks/Bat.sol');
const Rep = artifacts.require('mocks/Rep.sol');
const Zrx = artifacts.require('mocks/Zrx.sol');
const Dex = artifacts.require('Dex.sol');

contract('Dex', (accounts) => {
    let dai, bat, rep, zrx, dex;
    const [trader1, trader2] = [accounts[1], accounts[2]]; //accounts[0] will be the admin
    const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX'].map(ticker => web3.utils.fromAscii(ticker));

    beforeEach(async () => {
        ([dai, bat, rep, zrx] = await Promise.all([
            Dai.new(),
            Bat.new(),
            Rep.new(),
            Zrx.new()
        ]));
        dex = await Dex.new();
        await Promise.all([
            dex.addToken(DAI, dai.address),
            dex.addToken(BAT, bat.address),
            dex.addToken(REP, rep.address),
            dex.addToken(ZRX, zrx.address)
        ]);

        const amount = web3.utils.toWei('1000'); // a util to convert a number to wei
        const seedTokenBalance = async (token, trader) => {
            await token.faucet(trader, amount);
            await token.approve(dex.address, amount, { from: trader }); // we approve the token in our dex to do tx
        };
        // Load funds to trader1 with the faucet
        await Promise.all(
            [dai, bat, rep, zrx].map(
                token => seedTokenBalance(token, trader1)
            )
        );
        // Load funds to trader2 with the faucet
        await Promise.all(
            [dai, bat, rep, zrx].map(
                token => seedTokenBalance(token, trader2)
            )
        );
    });

    // DEPOSIT TESTS ---------------------------------------------------------------------------
    it('should deposit tokens', async () => {
        const amount = web3.utils.toWei('100');

        await dex.deposit(amount,DAI,{from:trader1});
        const balance = await dex.traderBalances(trader1,DAI);
        assert(balance.toString() === amount);
    });

    it('should NOT deposit tokens if token does not exist', async () => {
        const amount = web3.utils.toWei('100');

        await expectRevert(
            dex.deposit(amount,web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),{from:trader1}),
            'this token does not exist'
        );
    });
    // DEPOSIT TESTS ---------------------------------------------------------------------------
    
    // WITHDRAW TESTS ---------------------------------------------------------------------------
    it('should withdraw tokens', async () => {
        const amount = web3.utils.toWei('100');
        const initialTraderBalance = web3.utils.toWei('1000');
        await dex.deposit(amount,DAI,{from:trader1});

        await dex.withdraw(amount,DAI,{from:trader1});
        const [balanceDex, balanceDai] = await Promise.all(
            [dex.traderBalances(trader1,DAI),dai.balanceOf(trader1)]
        );
        assert(balanceDex.isZero());
        assert(balanceDai.toString() === initialTraderBalance);
    });

    it('should NOT withdraw tokens if token does not exist', async () => {
        const amount = web3.utils.toWei('100');
        await expectRevert(
            dex.withdraw(amount,web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),{from:trader1}),
            'this token does not exist'
        );
    });
    
    it('should NOT withdraw tokens if balance is too low', async () => {
        const amount = web3.utils.toWei('100');
        const amountToWithdraw = web3.utils.toWei('1000');
        await dex.deposit(amount,DAI,{from:trader1});

        await expectRevert(
            dex.withdraw(amountToWithdraw,DAI,{from:trader1}),
            'balance too low'
        );
    });
    // WITHDRAW TESTS ---------------------------------------------------------------------------
    

});