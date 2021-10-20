const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Marketplace', function () {
  it('Should handle single item sell', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address

    await nft.createNFT('demo.marketplace.0')

    expect(await nft.ownerOf(0)).to.equal(signers[0].address)

    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy()
    await market.deployed()

    await nft.approve(market.address, 0)

    await market.sellNFT(tokenAddress, 0, ethers.utils.parseEther('0.01'))

    expect(await nft.ownerOf(0)).to.equal(market.address)

    await nft.createNFT('demo.marketplace.1')

    expect(await nft.ownerOf(1)).to.equal(signers[0].address)

    await expect(
      market.sellNFT(tokenAddress, 1, ethers.utils.parseEther('0.01'))
    ).to.be.revertedWith('ERC721: transfer caller is not owner nor approved')

    expect(await nft.ownerOf(1)).to.equal(signers[0].address)
  })

  it('Should handle single item buy', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address

    await nft.createNFT('demo.marketplace.0')

    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy()
    await market.deployed()

    await nft.approve(market.address, 0)

    await market.sellNFT(tokenAddress, 0, ethers.utils.parseEther('0.01'))

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })

    expect(await nft.ownerOf(0)).to.equal(signers[1].address)
  })

  // it('Show...', async function () {
  //   const Marketplace = await ethers.getContractFactory('Marketplace')
  //   const market = await Marketplace.deploy()
  //   await market.deployed()

  // })
})
