/* istanbul ignore else */
if (window.blueprintUE === undefined) {
    /**
     * This namespace is attached to `window`.<br>
     * It's the main namespace leading to another namespace called `render`.
     *
     * @namespace
     */
    window.blueprintUE = {};
}
/* istanbul ignore else */
if (window.blueprintUE.uasset === undefined) {
    /**
     * This namespace is attached to `window.blueprintUE`.<br>
     * It will only expose the `Main` class.<br>
     *
     * @namespace
     */
    window.blueprintUE.uasset = {};
}

/**
 * Uasset structure.
 *
 * @typedef Uasset
 * @property {HexView[]}            hexView               - list of bytes read with position and type in file
 * @property {object}               header                - header file
 * @property {Name[]}               names                 - to fill
 * @property {GatherableTextData[]} gatherableTextData    - to fill
 * @property {object}               imports               - to fill
 * @property {object}               exports               - to fill
 * @property {object}               depends               - to fill
 * @property {object}               softPackageReferences - to fill
 * @property {object}               searchableNames       - to fill
 * @property {Thumbnails}           thumbnails            - to fill
 * @property {object}               assetRegistryData     - to fill
 * @property {object}               preloadDependency     - to fill
 * @property {object}               bulkDataStart         - to fill
 */

/**
 * HexView structure.
 *
 * @typedef HexView
 * @property {string} key   - name of what we read
 * @property {string} type  - type name of what we read (int16, int32, etc...)
 * @property {string} value - value read
 * @property {number} start - start position in the file
 * @property {number} stop  - stop position in the file
 */

/**
 * Name structure.
 *
 * @typedef Name
 * @property {string} Name                  - value
 * @property {number} NonCasePreservingHash - hash of value with case non preserved (upper)
 * @property {number} CasePreservingHash    - hash of value with case preserved
 */

// region GatherableTextData
/**
 * GatherableTextData Structure.
 *
 * @typedef GatherableTextData
 * @property {string}               NamespaceName      - to fill
 * @property {SourceData}           SourceData         - to fill
 * @property {SourceSiteContexts[]} SourceSiteContexts - to fill
 */

/**
 * SourceData Structure.
 *
 * @typedef SourceData
 * @property {string}                     SourceString         - to fill
 * @property {GatherableTextDataMetadata} SourceStringMetaData - to fill
 */

/**
 * SourceSiteContexts Structure.
 *
 * @typedef SourceSiteContexts
 * @property {string}                     KeyName         - to fill
 * @property {string}                     SiteDescription - to fill
 * @property {number}                     IsEditorOnly    - to fill
 * @property {number}                     IsOptional      - to fill
 * @property {GatherableTextDataMetadata} InfoMetaData    - to fill
 * @property {GatherableTextDataMetadata} KeyMetaData     - to fill
 */

/**
 * GatherableTextDataMetadata Structure.
 *
 * @typedef GatherableTextDataMetadata
 * @property {number} ValueCount - to fill
 * @property {any[]}  Values     - to fill
 */
// endregion

// region Thumbnails
/**
 * Thumbnails Structure.
 *
 * @typedef Thumbnails
 * @property {ThumbnailsIndex[]}      Index      - index
 * @property {ThumbnailsThumbnails[]} Thumbnails - thumbnails
 */

/**
 * Thumbnails Index Structure
 *
 * @typedef ThumbnailsIndex
 * @property {string} AssetClassName               - class name
 * @property {string} ObjectPathWithoutPackageName - path
 * @property {number} FileOffset                   - position in file
 */

/**
 * Thumbnails Thumbnails Structure
 *
 * @typedef ThumbnailsThumbnails
 * @property {number}   ImageWidth    - width
 * @property {number}   ImageHeight   - height
 * @property {string}   ImageFormat   - format (PNG or JPEG)
 * @property {number}   ImageSizeData - how many bytes used in file
 * @property {number[]} ImageData     - raw data
 */
// endregion
