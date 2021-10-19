const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Marketplace', function () {
  it('', async function () {
    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy('Hello, world!')
    await market.deployed()

    // expect().to.equal();
  })
})
