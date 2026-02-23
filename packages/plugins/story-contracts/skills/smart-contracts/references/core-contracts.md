# Core Contract Interfaces

Detailed interface documentation for each Story Protocol core contract, including function signatures, key events, and common Solidity usage patterns.

## IPAssetRegistry

The global registry for all IP Assets. Registers ERC-721 NFTs and deploys ERC-6551 IP Accounts.

**Address:** `0x77319B4031e6eF1250907aa00018B8B1c67a244b`
**Import:** `@story-protocol/core/registries/IPAssetRegistry.sol`

### Functions

```solidity
/// @notice Registers an NFT as an IP Asset, deploying an IP Account (ERC-6551 TBA).
/// @param chainid The chain ID where the NFT lives.
/// @param tokenContract The ERC-721 contract address.
/// @param tokenId The token ID of the NFT.
/// @return ipId The address of the deployed IP Account.
function register(uint256 chainid, address tokenContract, uint256 tokenId)
    external returns (address ipId);

/// @notice Computes the deterministic IP Account address for an NFT (no tx needed).
/// @param chainid The chain ID.
/// @param tokenContract The ERC-721 contract address.
/// @param tokenId The token ID.
/// @return ipId The IP Account address.
function ipId(uint256 chainid, address tokenContract, uint256 tokenId)
    external view returns (address);

/// @notice Checks whether an IP Account address is registered.
/// @param id The IP Account address to check.
/// @return True if registered, false otherwise.
function isRegistered(address id) external view returns (bool);

/// @notice Returns the total number of registered IPs.
function totalSupply() external view returns (uint256);
```

### Events

```solidity
event IPRegistered(
    address ipId,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    string name,
    string uri,
    uint256 registrationDate
);
```

### Usage Pattern

```solidity
import { IPAssetRegistry } from "@story-protocol/core/registries/IPAssetRegistry.sol";

contract MyContract {
    IPAssetRegistry public constant IP_ASSET_REGISTRY =
        IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b);

    function registerMyNft(address nftContract, uint256 tokenId) external returns (address) {
        // Caller must own the NFT
        address ipId = IP_ASSET_REGISTRY.register(block.chainid, nftContract, tokenId);
        return ipId;
    }

    function getIpId(address nftContract, uint256 tokenId) external view returns (address) {
        return IP_ASSET_REGISTRY.ipId(block.chainid, nftContract, tokenId);
    }
}
```

## LicensingModule

Manages the attachment of license terms to IPs and minting of license tokens.

**Address:** `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f`
**Import:** `@story-protocol/core/modules/licensing/LicensingModule.sol`

### Functions

```solidity
/// @notice Attaches license terms to an IP Asset.
/// @param ipId The IP Account address.
/// @param licenseTemplate The license template contract (usually PILicenseTemplate).
/// @param licenseTermsId The ID of the registered license terms.
function attachLicenseTerms(address ipId, address licenseTemplate, uint256 licenseTermsId)
    external;

/// @notice Mints license tokens for a licensor IP.
/// @param licensorIpId The IP from which to mint a license.
/// @param licenseTemplate The license template contract.
/// @param licenseTermsId The license terms ID.
/// @param amount Number of license tokens to mint.
/// @param receiver Address to receive the license tokens.
/// @param royaltyContext Additional context for royalty (usually empty bytes).
/// @return startLicenseTokenId The first minted license token ID.
function mintLicenseTokens(
    address licensorIpId,
    address licenseTemplate,
    uint256 licenseTermsId,
    uint256 amount,
    address receiver,
    bytes calldata royaltyContext
) external returns (uint256 startLicenseTokenId);

/// @notice Registers a derivative IP by linking it to parent IPs.
/// @param childIpId The child IP Account address.
/// @param parentIpIds Array of parent IP Account addresses.
/// @param licenseTermsIds Array of license terms IDs (one per parent).
/// @param licenseTemplate The license template contract.
/// @param royaltyContext Additional royalty context.
/// @param maxMintingFee Maximum minting fee willing to pay.
/// @param maxRts Maximum royalty tokens.
/// @param maxRevenueShare Maximum revenue share percentage.
function registerDerivative(
    address childIpId,
    address[] calldata parentIpIds,
    uint256[] calldata licenseTermsIds,
    address licenseTemplate,
    bytes calldata royaltyContext,
    uint256 maxMintingFee,
    uint256 maxRts,
    uint256 maxRevenueShare
) external;
```

### Events

```solidity
event LicenseTermsAttached(
    address caller,
    address ipId,
    address licenseTemplate,
    uint256 licenseTermsId
);

event LicenseTokensMinted(
    address caller,
    address licensorIpId,
    address licenseTemplate,
    uint256 licenseTermsId,
    uint256 amount,
    address receiver,
    uint256 startLicenseTokenId
);

event DerivativeRegistered(
    address caller,
    address childIpId,
    uint256[] licenseTokenIds,
    address[] parentIpIds,
    uint256[] licenseTermsIds,
    address licenseTemplate
);
```

### Usage Pattern

```solidity
import { LicensingModule } from "@story-protocol/core/modules/licensing/LicensingModule.sol";
import { PILicenseTemplate, PILTerms } from "@story-protocol/core/modules/licensing/PILicenseTemplate.sol";

contract MyLicensingContract {
    LicensingModule public constant LICENSING =
        LicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f);
    PILicenseTemplate public constant PIL =
        PILicenseTemplate(0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316);

    function attachAndMint(address ipId, uint256 termsId, address receiver) external {
        // Step 1: Attach terms to the IP (caller must be IP owner or authorized)
        LICENSING.attachLicenseTerms(ipId, address(PIL), termsId);

        // Step 2: Mint 1 license token
        uint256 startId = LICENSING.mintLicenseTokens(
            ipId, address(PIL), termsId, 1, receiver, ""
        );
    }
}
```

## PILicenseTemplate

The Programmable IP License template. Used to register and retrieve license terms.

**Address:** `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316`
**Import:** `@story-protocol/core/modules/licensing/PILicenseTemplate.sol`

### Functions

```solidity
/// @notice Registers new license terms and returns the assigned ID.
/// @param terms The PIL terms struct.
/// @return id The license terms ID.
function registerLicenseTerms(PILTerms calldata terms) external returns (uint256 id);

/// @notice Gets license terms by ID.
/// @param id The license terms ID.
/// @return terms The PIL terms struct.
function getLicenseTerms(uint256 id) external view returns (PILTerms memory);

/// @notice Gets the ID of license terms if they already exist.
/// @param terms The PIL terms to look up.
/// @return id The license terms ID (0 if not found).
function getLicenseTermsId(PILTerms calldata terms) external view returns (uint256);

/// @notice Checks if license terms exist.
/// @param id The license terms ID to check.
/// @return True if the terms exist.
function exists(uint256 id) external view returns (bool);
```

### PILTerms Struct

```solidity
struct PILTerms {
    bool transferable;                  // Can license tokens be transferred?
    address royaltyPolicy;              // RoyaltyPolicyLAP or RoyaltyPolicyLRP address
    uint256 defaultMintingFee;          // Fee to mint a license token (in currency units)
    uint256 expiration;                 // License expiration timestamp (0 = never)
    bool commercialUse;                 // Allows commercial use of the IP?
    bool commercialAttribution;         // Requires attribution for commercial use?
    address commercialRevShare;         // Revenue share percentage (in basis points for LAP)
    uint256 commercialRevCeiling;       // Max revenue before license expires (0 = no limit)
    bool derivativesAllowed;            // Can derivatives be created?
    bool derivativesAttribution;        // Requires attribution for derivatives?
    bool derivativesApproval;           // Requires approval for each derivative?
    bool derivativesReciprocal;         // Derivatives must use same license?
    uint256 derivativeRevCeiling;       // Max derivative revenue (0 = no limit)
    address currency;                   // Payment token address (WIP, USDC, etc.)
    string uri;                         // URI for human-readable license text
}
```

## RoyaltyModule

Manages royalty payments between IP Assets.

**Address:** `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086`
**Import:** `@story-protocol/core/modules/royalty/RoyaltyModule.sol`

### Functions

```solidity
/// @notice Pays royalties from payer IP to receiver IP.
/// @param receiverIpId The IP receiving the royalty payment.
/// @param payerIpId The IP making the payment.
/// @param token The ERC-20 token used for payment.
/// @param amount The amount to pay.
function payRoyaltyOnBehalf(
    address receiverIpId,
    address payerIpId,
    address token,
    uint256 amount
) external;
```

### Events

```solidity
event RoyaltyPaid(
    address receiverIpId,
    address payerIpId,
    address sender,
    address token,
    uint256 amount
);
```

### Usage Pattern

```solidity
import { RoyaltyModule } from "@story-protocol/core/modules/royalty/RoyaltyModule.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyRoyaltyContract {
    RoyaltyModule public constant ROYALTY =
        RoyaltyModule(0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086);
    address public constant WIP = 0x1514000000000000000000000000000000000000;

    function payRoyalty(address parentIp, address childIp, uint256 amount) external {
        // Must approve RoyaltyModule first
        IERC20(WIP).approve(address(ROYALTY), amount);
        ROYALTY.payRoyaltyOnBehalf(parentIp, childIp, WIP, amount);
    }
}
```

## DisputeModule

Allows anyone to raise disputes against IP Assets and supports resolution by arbitrators.

**Address:** `0x9b7A9c70AFF961C799110954fc06F3093aeb94C5`
**Import:** `@story-protocol/core/modules/dispute/DisputeModule.sol`

### Functions

```solidity
/// @notice Raises a dispute against a target IP.
/// @param targetIpId The IP being disputed.
/// @param linkToDisputeEvidence URI to the evidence (e.g., IPFS link).
/// @param targetTag Dispute category tag (e.g., keccak256("PLAGIARISM")).
/// @param data Additional data for the arbitration policy.
/// @return disputeId The ID of the created dispute.
function raiseDispute(
    address targetIpId,
    string calldata linkToDisputeEvidence,
    bytes32 targetTag,
    bytes calldata data
) external returns (uint256 disputeId);

/// @notice Resolves a dispute. Only callable by the arbitration policy.
/// @param disputeId The ID of the dispute to resolve.
/// @param data Resolution data.
function resolveDispute(uint256 disputeId, bytes calldata data) external;

/// @notice Cancels a dispute. Only callable by the dispute initiator.
/// @param disputeId The ID of the dispute to cancel.
/// @param data Cancellation data.
function cancelDispute(uint256 disputeId, bytes calldata data) external;
```

### Events

```solidity
event DisputeRaised(
    uint256 disputeId,
    address targetIpId,
    address disputeInitiator,
    bytes32 arbitrationPolicy,
    bytes32 linkToDisputeEvidence,
    bytes32 targetTag,
    bytes data
);

event DisputeResolved(uint256 disputeId);
event DisputeCancelled(uint256 disputeId);
```

## AccessController

Manages a permission table controlling which addresses can call module functions on behalf of IP Accounts.

**Address:** `0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a`
**Import:** `@story-protocol/core/access/AccessController.sol`

### Functions

```solidity
/// @notice Sets permission for a signer to call a function on a module for an IP.
/// @param ipAccount The IP Account address.
/// @param signer The address being granted/denied permission.
/// @param to The target module address (address(0) = all modules).
/// @param func The function selector (bytes4(0) = all functions).
/// @param permission 0=ABSTAIN, 1=ALLOW, 2=DENY.
function setPermission(
    address ipAccount,
    address signer,
    address to,
    bytes4 func,
    uint8 permission
) external;

/// @notice Checks if a signer has permission. Reverts if denied.
/// @param ipAccount The IP Account address.
/// @param signer The address to check.
/// @param to The target module address.
/// @param func The function selector.
function checkPermission(
    address ipAccount,
    address signer,
    address to,
    bytes4 func
) external view;

/// @notice Gets the permission value without reverting.
/// @return The permission value (0=ABSTAIN, 1=ALLOW, 2=DENY).
function getPermission(
    address ipAccount,
    address signer,
    address to,
    bytes4 func
) external view returns (uint8);
```

### Permission Constants

```solidity
uint8 constant ABSTAIN = 0;  // No explicit rule (falls through)
uint8 constant ALLOW = 1;    // Explicitly allowed
uint8 constant DENY = 2;     // Explicitly denied
```

### Wildcard Patterns

```solidity
// Allow signer to call ONE specific function on ONE specific module
ACCESS_CONTROLLER.setPermission(ipId, signer, moduleAddr, funcSelector, 1);

// Allow signer to call ANY function on ONE specific module
ACCESS_CONTROLLER.setPermission(ipId, signer, moduleAddr, bytes4(0), 1);

// Allow signer to call ANY function on ANY module
ACCESS_CONTROLLER.setPermission(ipId, signer, address(0), bytes4(0), 1);
```

### Resolution Order

1. Specific: `(ipAccount, signer, module, function)` -- checked first
2. Module wildcard: `(ipAccount, signer, module, bytes4(0))`
3. Global wildcard: `(ipAccount, signer, address(0), bytes4(0))`
4. Default: DENY (if no matching rule found)

### Usage Pattern

```solidity
import { AccessController } from "@story-protocol/core/access/AccessController.sol";
import { LicensingModule } from "@story-protocol/core/modules/licensing/LicensingModule.sol";

contract MyPermissionManager {
    AccessController public constant ACCESS =
        AccessController(0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a);
    LicensingModule public constant LICENSING =
        LicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f);

    /// @notice Grant an operator permission to attach license terms on an IP.
    /// @dev Caller must be the IP Account owner (NFT holder).
    function grantLicensingPermission(address ipId, address operator) external {
        ACCESS.setPermission(
            ipId,
            operator,
            address(LICENSING),
            LICENSING.attachLicenseTerms.selector,
            1 // ALLOW
        );
    }

    /// @notice Revoke all permissions for an operator on an IP.
    function revokeAll(address ipId, address operator) external {
        ACCESS.setPermission(ipId, operator, address(0), bytes4(0), 2); // DENY
    }
}
```

## CoreMetadataModule

Manages onchain metadata for IP Assets.

**Address:** `0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16`
**Import:** `@story-protocol/core/modules/metadata/CoreMetadataModule.sol`

### Functions

```solidity
/// @notice Sets all metadata fields for an IP.
/// @param ipId The IP Account address.
/// @param metadataURI URI pointing to the IP metadata JSON.
/// @param metadataHash SHA-256 hash of the metadata JSON.
/// @param nftMetadataHash SHA-256 hash of the NFT metadata JSON.
function setAll(
    address ipId,
    string calldata metadataURI,
    bytes32 metadataHash,
    bytes32 nftMetadataHash
) external;

/// @notice Updates just the metadata hash.
/// @param ipId The IP Account address.
/// @param metadataHash New SHA-256 hash.
function updateMetadataHash(address ipId, bytes32 metadataHash) external;

/// @notice Freezes metadata permanently (irreversible).
/// @param ipId The IP Account address.
function freezeMetadata(address ipId) external;

/// @notice Checks if metadata is frozen.
/// @param ipId The IP Account address.
/// @return True if frozen.
function isMetadataFrozen(address ipId) external view returns (bool);
```

### Events

```solidity
event MetadataSet(address ipId, string metadataURI, bytes32 metadataHash, bytes32 nftMetadataHash);
event MetadataFrozen(address ipId);
```

### Usage Pattern

```solidity
import { CoreMetadataModule } from "@story-protocol/core/modules/metadata/CoreMetadataModule.sol";

contract MyMetadataContract {
    CoreMetadataModule public constant METADATA =
        CoreMetadataModule(0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16);

    function setMetadata(
        address ipId,
        string calldata uri,
        bytes32 ipHash,
        bytes32 nftHash
    ) external {
        // Caller must be IP owner or authorized via AccessController
        METADATA.setAll(ipId, uri, ipHash, nftHash);
    }

    function lockMetadata(address ipId) external {
        // WARNING: This is irreversible
        METADATA.freezeMetadata(ipId);
    }
}
```

## GroupingModule

Manages grouping of IP Assets for shared revenue distribution.

**Address:** `0x69D3a7aa9edb72Bc226E745A7cCdd50D947b69Ac`
**Import:** `@story-protocol/core/modules/grouping/GroupingModule.sol`

### Functions

```solidity
/// @notice Registers a new IP group.
/// @param groupPool The group pool contract address (e.g., EvenSplitGroupPool).
/// @return groupId The IP Account address of the created group.
function registerGroup(address groupPool) external returns (address groupId);

/// @notice Adds an IP to an existing group.
/// @param groupIpId The group IP Account address.
/// @param ipIds Array of IP Account addresses to add.
function addIp(address groupIpId, address[] calldata ipIds) external;

/// @notice Removes an IP from a group.
/// @param groupIpId The group IP Account address.
/// @param ipIds Array of IP Account addresses to remove.
function removeIp(address groupIpId, address[] calldata ipIds) external;
```

### Usage Pattern

```solidity
import { GroupingModule } from "@story-protocol/core/modules/grouping/GroupingModule.sol";

GroupingModule public constant GROUPING =
    GroupingModule(0x69D3a7aa9edb72Bc226E745A7cCdd50D947b69Ac);
address public constant EVEN_SPLIT_POOL =
    0xf96f2c30b41Cb6e0290de43C8528ae83d4f33F89;

// Create a group with even revenue split
address groupId = GROUPING.registerGroup(EVEN_SPLIT_POOL);

// Add IPs to the group
address[] memory ips = new address[](2);
ips[0] = ipId1;
ips[1] = ipId2;
GROUPING.addIp(groupId, ips);
```
