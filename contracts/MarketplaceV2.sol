//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be have been allowed to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId)
        external
        view
        returns (address operator);

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool _approved) external;

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;
}

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721.onERC721Received.selector`.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

abstract contract Initializable {
    /**
     * @dev Indicates that the contract has been initialized.
     */
    bool private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Modifier to protect an initializer function from being invoked twice.
     */
    modifier initializer() {
        require(
            _initializing || !_initialized,
            "Initializable: contract is already initialized"
        );

        bool isTopLevelCall = !_initializing;
        if (isTopLevelCall) {
            _initializing = true;
            _initialized = true;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;
        }
    }
}

abstract contract ReentrancyGuard is Initializable {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    function initialize() public virtual initializer {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and make it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}

contract MarketplaceV2 is IERC721Receiver, ReentrancyGuard {
    uint256 public itemsForSale;
    uint256 public totalSales;

    struct Token {
        address tokenAddress;
        uint256 tokenId;
    }

    struct Item {
        address seller;
        address owner;
        uint256 price;
    }

    struct Sell {
        address buyer;
        uint256 price;
    }

    Token[] private assets;

    mapping(address => mapping(uint256 => bool)) private resell;
    mapping(address => mapping(uint256 => Item)) private items;
    mapping(address => mapping(uint256 => Sell[])) private history;

    event AddedToMarket(
        address indexed seller,
        address indexed owner,
        address indexed tokenAddress,
        uint256 tokenId,
        uint256 price
    );
    event RetiredFromMarket(
        address indexed seller,
        address indexed owner,
        address indexed tokenAddress,
        uint256 tokenId,
        uint256 price
    );

    function sellNFT(
        address _tokenAddress,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant returns (bool) {
        require(_price >= 0.01 ether, "Too low price.");

        Item memory item = Item({
            seller: msg.sender,
            owner: address(0),
            price: _price
        });

        items[_tokenAddress][_tokenId] = item;

        if (!resell[_tokenAddress][_tokenId]) {
            Token memory nft = Token({
                tokenAddress: _tokenAddress,
                tokenId: _tokenId
            });

            assets.push(nft);
            resell[_tokenAddress][_tokenId] = true;
        }

        itemsForSale += 1;

        IERC721(_tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId
        );

        emit AddedToMarket(
            msg.sender,
            address(0),
            _tokenAddress,
            _tokenId,
            _price
        );

        return true;
    }

    function buyNFT(address _tokenAddress, uint256 _tokenId)
        external
        payable
        nonReentrant
        returns (bool)
    {
        Item memory nft = items[_tokenAddress][_tokenId];

        require(nft.price == msg.value, "Offer cannot be accepted.");

        items[_tokenAddress][_tokenId] = Item({
            seller: address(0),
            owner: msg.sender,
            price: 0
        });

        history[_tokenAddress][_tokenId].push(
            Sell({buyer: msg.sender, price: nft.price})
        );

        totalSales += 1;
        itemsForSale -= 1;

        (bool success, ) = nft.seller.call{value: msg.value}("");

        require(success, "Transaction failed.");

        IERC721(_tokenAddress).safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId
        );

        emit RetiredFromMarket(
            nft.seller,
            msg.sender,
            _tokenAddress,
            _tokenId,
            nft.price
        );

        return true;
    }

    function getItem(address _tokenAddress, uint256 _tokenId)
        external
        view
        returns (Item memory)
    {
        return items[_tokenAddress][_tokenId];
    }

    function isForSale(address _tokenAddress, uint256 _tokenId)
        external
        view
        returns (bool)
    {
        Item memory nft = items[_tokenAddress][_tokenId];

        return nft.seller != address(0);
    }

    function getAssetsForSale(uint256 _cursor, uint256 _batchSize)
        external
        view
        returns (Token[] memory)
    {
        if (_cursor >= assets.length) {
            return new Token[](0);
        }

        uint256 size = 0;
        uint256 limit = _batchSize;

        if (limit > 10) {
            limit = 10;
        }

        if (limit > assets.length - _cursor) {
            limit = assets.length - _cursor;
        }

        // Get response Array size.
        for (uint256 index = _cursor; size < limit; index++) {
            if (index >= assets.length) {
                break;
            }

            Token memory nft = assets[index];
            address seller = items[nft.tokenAddress][nft.tokenId].seller;

            if (seller != address(0)) {
                size += 1;
            }
        }

        uint256 count = 0;
        Token[] memory list = new Token[](size);

        // Create response Array.
        for (uint256 index = _cursor; count < limit; index++) {
            if (index >= assets.length) {
                break;
            }

            Token memory nft = assets[index];
            address seller = items[nft.tokenAddress][nft.tokenId].seller;

            if (seller != address(0)) {
                list[count] = nft;
                count += 1;
            }
        }

        return list;
    }

    function getAllAssets(uint256 _cursor, uint256 _batchSize)
        external
        view
        returns (Token[] memory)
    {
        if (_cursor >= assets.length) {
            return new Token[](0);
        }

        uint256 count = 0;
        uint256 limit = _batchSize;

        if (limit > 10) {
            limit = 10;
        }

        if (limit > assets.length - _cursor) {
            limit = assets.length - _cursor;
        }

        Token[] memory list = new Token[](limit);

        for (uint256 index = _cursor; index < limit + _cursor; index++) {
            list[count] = assets[index];
            count += 1;
        }

        return list;
    }

    function simpleUpgradeTest() external pure returns (string memory) {
        return "Upgraded!";
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
