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

    await expect(
      market
        .connect(signers[1])
        .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.009') })
    ).to.be.revertedWith('Offer cannot be accepted.')

    await expect(
      market
        .connect(signers[1])
        .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.02') })
    ).to.be.revertedWith('Offer cannot be accepted.')

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })

    await expect(
      market
        .connect(signers[2])
        .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })
    ).to.be.reverted

    expect(await nft.ownerOf(0)).to.equal(signers[1].address)
  })

  it('Should get NFT info before and after being bought', async function () {
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

    const data0 = await market.getItem(tokenAddress, 0)

    expect(data0.seller).to.equal(signers[0].address)
    expect(data0.owner).to.equal('0x0000000000000000000000000000000000000000')
    expect(data0.price).to.equal(ethers.utils.parseEther('0.01'))

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })

    const data1 = await market.getItem(tokenAddress, 0)

    expect(data1.seller).to.equal('0x0000000000000000000000000000000000000000')
    expect(data1.owner).to.equal(signers[1].address)
    expect(data1.price).to.equal(0)
  })

  it('Should check if NFT is for sale', async function () {
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

    const data1 = await market.isForSale(tokenAddress, 0)

    expect(data1).to.be.true

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })

    const data2 = await market.isForSale(tokenAddress, 0)
    expect(data2).to.be.false

    const data3 = await market.isForSale(tokenAddress, 1)
    expect(data3).to.be.false
  })

  it('Should get assets for sale list', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address

    await nft.createNFT('demo.marketplace.0')
    await nft.createNFT('demo.marketplace.1')
    await nft.createNFT('demo.marketplace.2')
    await nft.createNFT('demo.marketplace.3')
    await nft.createNFT('demo.marketplace.4')

    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy()
    await market.deployed()

    await nft.setApprovalForAll(market.address, true)

    await market.sellNFT(tokenAddress, 0, ethers.utils.parseEther('0.01'))
    await market.sellNFT(tokenAddress, 1, ethers.utils.parseEther('0.01'))
    await market.sellNFT(tokenAddress, 2, ethers.utils.parseEther('0.01'))
    await market.sellNFT(tokenAddress, 3, ethers.utils.parseEther('0.01'))
    await market.sellNFT(tokenAddress, 4, ethers.utils.parseEther('0.01'))

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 2, { value: ethers.utils.parseEther('0.01') })

    const list = await market.getAssetsForSale()

    expect(list.length).to.equal(4)
  })
})
