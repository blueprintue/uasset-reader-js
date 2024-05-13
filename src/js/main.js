/* global DataView, EPackageFileTag, EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version, GatherableTextData, SourceSiteContexts, Uasset, Uint8Array */
/**
 * Main public entry point.
 *
 * @class ReaderUasset
 */
function ReaderUasset() {
    this.currentIdx = 0;
    this.bytes = [];

    /** @type {Uasset} */
    this.uasset = {
        hexView: [],
        header: {},
        names: [],
        gatherableTextData: [],
        imports: {},
        exports: [],
        depends: {},
        softPackageReferences: {},
        searchableNames: {},
        thumbnails: {Index: [], Thumbnails: []},
        assetRegistryData: {},
        preloadDependency: {},
        bulkDataStart: {}
    };
}

// region helpers
/**
 * Read 2 bytes, save in hex view and return value as uint16 en littleEndian.
 *
 * @function ReaderUasset#uint16
 * @param {string} key - name of what we read
 * @returns {number}
 * @private
 */
ReaderUasset.prototype.uint16 = function uint16(key) {
    /** @type {number} */
    var val;
    /** @type {number[]} */
    var bytes = this.readCountBytes(2);

    val = new DataView(new Uint8Array(bytes).buffer).getUint16(0, this.useLittleEndian);

    this.addHexView(key, "uint16", val, this.currentIdx - 2, this.currentIdx - 1);

    return val;
};

/**
 * Read 4 bytes, save in hex view and return value as int32 en littleEndian.
 *
 * @function ReaderUasset#int32
 * @param {string} key - name of what we read
 * @returns {number}
 * @private
 */
ReaderUasset.prototype.int32 = function int32(key) {
    /** @type {number} */
    var val;
    /** @type {number[]} */
    var bytes = this.readCountBytes(4);

    val = new DataView(new Uint8Array(bytes).buffer).getInt32(0, this.useLittleEndian);

    this.addHexView(key, "int32", val, this.currentIdx - 4, this.currentIdx - 1);

    return val;
};

/**
 * Read 4 bytes, save in hex view and return value as uint32 en littleEndian.
 *
 * @function ReaderUasset#uint32
 * @param {string} key - name of what we read
 * @returns {number}
 * @private
 */
ReaderUasset.prototype.uint32 = function uint32(key) {
    /** @type {number} */
    var val;
    /** @type {number[]} */
    var bytes = this.readCountBytes(4);

    val = new DataView(new Uint8Array(bytes).buffer).getUint32(0, this.useLittleEndian);

    this.addHexView(key, "uint32", val, this.currentIdx - 4, this.currentIdx - 1);

    return val;
};

/**
 * Read 8 bytes, save in hex view and return value as int64 en littleEndian.
 *
 * @function ReaderUasset#int64
 * @param {string} key - name of what we read
 * @returns {number}
 * @private
 */
ReaderUasset.prototype.int64 = function int64(key) {
    /** @type {bigint} */
    var val;
    /** @type {number[]} */
    var bytes = this.readCountBytes(8);

    val = new DataView(new Uint8Array(bytes).buffer).getBigInt64(0, this.useLittleEndian);

    this.addHexView(key, "int64", val, this.currentIdx - 8, this.currentIdx - 1);

    return val;
};

/**
 * Read 8 bytes, save in hex view and return value as uint64 en littleEndian.
 *
 * @function ReaderUasset#uint64
 * @param {string} key - name of what we read
 * @returns {number}
 * @private
 */
ReaderUasset.prototype.uint64 = function uint64(key) {
    /** @type {bigint} */
    var val;
    /** @type {number[]} */
    var bytes = this.readCountBytes(8);

    val = new DataView(new Uint8Array(bytes).buffer).getBigUint64(0, this.useLittleEndian);

    this.addHexView(key, "uint64", val, this.currentIdx - 8, this.currentIdx - 1);

    return val;
};

/**
 * Read 16 bytes, save in hex view and return value as string.
 *
 * @function ReaderUasset#fguidSlot
 * @param {string} key - name of what we read
 * @returns {string}
 * @private
 */
ReaderUasset.prototype.fguidSlot = function fguidSlot(key) {
    /** @type {string} */
    var val;
    /** @type {string} */
    var str1 = "";
    /** @type {string} */
    var str2 = "";
    /** @type {string} */
    var str3 = "";
    /** @type {string} */
    var str4 = "";
    /** @type {number} */
    var idx = 3;
    /** @type {number[]} */
    var bytes = this.readCountBytes(16);

    for (; idx >= 0; --idx) {
        str1 = str1 + bytes[idx].toString(16).padStart(2, "0");
        str2 = str2 + bytes[idx + 4].toString(16).padStart(2, "0");
        str3 = str3 + bytes[idx + 8].toString(16).padStart(2, "0");
        str4 = str4 + bytes[idx + 12].toString(16).padStart(2, "0");
    }

    val = (str1 + str2 + str3 + str4).toUpperCase();

    this.addHexView(key, "fguidSlot", val, this.currentIdx - 16, this.currentIdx - 1);

    return val;
};

/**
 * Read 16 bytes, save in hex view and return value as string.
 *
 * @function ReaderUasset#fguidString
 * @param {string} key - name of what we read
 * @returns {string}
 * @private
 */
ReaderUasset.prototype.fguidString = function fguidString(key) {
    /** @type {string} */
    var val;
    /** @type {string} */
    var str = "";
    /** @type {number} */
    var idx = 0;
    /** @type {number[]} */
    var bytes = this.readCountBytes(16);

    for (; idx < 16; ++idx) {
        str = str + bytes[idx].toString(16).padStart(2, "0");
    }

    val = str.toUpperCase();

    this.addHexView(key, "fguidString", val, this.currentIdx - 16, this.currentIdx - 1);

    return val;
};

/**
 * Read 16 bytes, save in hex view and return value as string.
 *
 * @function ReaderUasset#fstring
 * @param {string} key - name of what we read
 * @returns {string}
 * @private
 */
ReaderUasset.prototype.fstring = function fstring(key) {
    /** @type {string} */
    var val;
    /** @type {number[]} */
    var bytes;
    /** @type {string} */
    var str = "";
    /** @type {number} */
    var counter = 0;
    /** @type {number[]} */
    var output = [];
    /** @type {string} */
    var value;
    /** @type {string} */
    var extra;
    /** @type {number} */
    var idx;
    /** @type {number} */
    var startPosition;

    var length = this.int32(key + " (fstring length)");
    if (length === 0) {
        return "";
    }

    startPosition = this.currentIdx;

    if (length > 0) {
        bytes = this.readCountBytes(length);
        for (idx = 0; idx < bytes.length - 1; ++idx) {
            str = str + String.fromCharCode(bytes[idx]);
        }

        val = str;

        this.addHexView(key, "fstring", val, startPosition, this.currentIdx - 1);

        return str;
    }

    /* eslint-disable */
    length = length * -1 * 2;
    bytes = this.readCountBytes(length);
    while (counter < bytes.length) {
        value = String.fromCharCode(bytes[counter++]);
        if (value >= 0xD800 && value <= 0xDBFF && counter < bytes.length) {
            extra = String.fromCharCode(bytes[counter++]);
            if ((extra & 0xFC00) === 0xDC00) {
                output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
            } else {
                output.push(value);
                counter--;
            }
        } else {
            output.push(value);
        }
    }
    /* eslint-enable */

    val = output.join("");

    this.addHexView(key, "fstring", val, startPosition, this.currentIdx - 1);

    return val;
};

/**
 * Read n bytes.
 *
 * @function ReaderUasset#readCountBytes
 * @param {number} count - number of bytes to read.
 * @returns {number[]}
 * @private
 */
ReaderUasset.prototype.readCountBytes = function readCountBytes(count) {
    var bytes = [];
    var idx = 0;

    for (; idx < count; ++idx) {
        bytes.push(this.bytes[this.currentIdx]);
        this.currentIdx = this.currentIdx + 1;
    }

    return bytes;
};

/**
 * Add informations in HexView struct.
 *
 * @function ReaderUasset#addHexView
 * @param {string} key           - name of what we read
 * @param {string} type          - type name of what we read (int16, int32, etc...)
 * @param {string} value         - value read
 * @param {number} startPosition - start position in the file
 * @param {number} stopPosition  - stop position in the file
 * @returns {undefined}
 * @private
 */
ReaderUasset.prototype.addHexView = function addHexView(key, type, value, startPosition, stopPosition) { /* eslint-disable-line max-params */
    if (this.saveHexView === false) {
        return;
    }

    this.uasset.hexView.push({
        key: key,
        type: type,
        value: value,
        start: startPosition,
        stop: stopPosition
    });
};

/**
 * Resolve FName.
 *
 * @function ReaderUasset#resolveFName
 * @param {number} idx - name of what we read
 * @returns {string}
 * @private
 */
ReaderUasset.prototype.resolveFName = function resolveFName(idx) {
    if (this.uasset.names[idx]) {
        return this.uasset.names[idx].Name;
    }

    return "";
};
// endregion

/**
 * Read Header.
 *
 * @function ReaderUasset#readHeader
 * @returns {(Error|undefined)}
 * @private
 * @see https://github.com/EpicGames/UnrealEngine/blob/5.0/Engine/Source/Runtime/CoreUObject/Private/UObject/PackageFileSummary.cpp#L48
 */
/* eslint-disable-next-line max-lines-per-function,max-statements,complexity */
ReaderUasset.prototype.readHeader = function readHeader() {
    /** @type {number} */
    var idx;
    /** @type {number} */
    var count;

    // Check file is uasset
    this.uasset.header.EPackageFileTag = this.uint32("EPackageFileTag");
    if (this.uasset.header.EPackageFileTag === EPackageFileTag.PACKAGE_FILE_TAG_SWAPPED) {
        // The package has been stored in a separate endianness
        this.useLittleEndian = false;
    }

    if (this.uasset.header.EPackageFileTag !== EPackageFileTag.PACKAGE_FILE_TAG &&
        this.uasset.header.EPackageFileTag !== EPackageFileTag.PACKAGE_FILE_TAG_SWAPPED) {
        return new Error("invalid uasset");
    }

    /**
     * Check file is not UE3
     *
     * The package file version number when this package was saved.
     *
     * Lower 16 bits stores the UE3 engine version
     * Upper 16 bits stores the UE licensee version
     * For newer packages this is -7:<br>
     * -2 indicates presence of enum-based custom versions<br>
     * -3 indicates guid-based custom versions<br>
     * -4 indicates removal of the UE3 version. Packages saved with this ID cannot be loaded in older engine versions<br>
     * -5 indicates the replacement of writing out the "UE3 version" so older versions of engine can gracefully fail to open newer packages<br>
     * -6 indicates optimizations to how custom versions are being serialized<br>
     * -7 indicates the texture allocation info has been removed from the summary<br>
     * -8 indicates that the UE5 version has been added to the summary
     */
    this.uasset.header.LegacyFileVersion = this.int32("LegacyFileVersion");
    /* eslint-disable-next-line no-magic-numbers */
    if (this.uasset.header.LegacyFileVersion !== -6 && this.uasset.header.LegacyFileVersion !== -7 && this.uasset.header.LegacyFileVersion !== -8) {
        return new Error("unsupported version");
    }

    /**
     * Next bytes is for UE3
     * No need to check because it will always be different of -4
     */
    this.uasset.header.LegacyUE3Version = this.int32("LegacyUE3Version");

    // Check file is valid UE4
    this.uasset.header.FileVersionUE4 = this.int32("FileVersionUE4");

    // Check valid UE5
    /* eslint-disable-next-line no-magic-numbers */
    if (this.uasset.header.LegacyFileVersion <= -8) {
        this.uasset.header.FileVersionUE5 = this.int32("FileVersionUE5");
    }

    this.uasset.header.FileVersionLicenseeUE4 = this.int32("FileVersionLicenseeUE4");
    if (this.uasset.header.FileVersionUE4 === 0 && this.uasset.header.FileVersionLicenseeUE4 === 0 && this.uasset.header.FileVersionUE5 === 0) {
        return new Error("asset unversioned");
    }

    count = this.int32("CustomVersions Count");
    this.uasset.header.CustomVersions = [];
    for (idx = 0; idx < count; ++idx) {
        this.uasset.header.CustomVersions.push({
            key: this.fguidSlot("CustomVersions #" + idx + ": key"),
            version: this.int32("CustomVersions #" + idx + ": version")
        });
    }

    this.uasset.header.TotalHeaderSize = this.int32("TotalHeaderSize");

    this.uasset.header.FolderName = this.fstring("FolderName");

    this.uasset.header.PackageFlags = this.uint32("PackageFlags");

    this.uasset.header.NameCount = this.int32("NameCount");
    this.uasset.header.NameOffset = this.int32("NameOffset");

    if (this.uasset.header.FileVersionUE5 >= EUnrealEngineObjectUE5Version.VER_UE5_ADD_SOFTOBJECTPATH_LIST.value) {
        this.uasset.header.SoftObjectPathsCount = this.uint32("SoftObjectPathsCount");
        this.uasset.header.SoftObjectPathsOffset = this.uint32("SoftObjectPathsOffset");
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_PACKAGE_SUMMARY_LOCALIZATION_ID.value) {
        this.uasset.header.LocalizationId = this.fstring("LocalizationId");
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_SERIALIZE_TEXT_IN_PACKAGES.value) {
        this.uasset.header.GatherableTextDataCount = this.int32("GatherableTextDataCount");
        this.uasset.header.GatherableTextDataOffset = this.int32("GatherableTextDataOffset");
    }

    this.uasset.header.ExportCount = this.int32("ExportCount");
    this.uasset.header.ExportOffset = this.int32("ExportOffset");

    this.uasset.header.ImportCount = this.int32("ImportCount");
    this.uasset.header.ImportOffset = this.int32("ImportOffset");

    this.uasset.header.DependsOffset = this.int32("DependsOffset");

    if (this.uasset.header.FileVersionUE4 < EUnrealEngineObjectUE4Version.VER_UE4_OLDEST_LOADABLE_PACKAGE.value) {
        return new Error("asset too old");
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADD_STRING_ASSET_REFERENCES_MAP.value) {
        this.uasset.header.SoftPackageReferencesCount = this.int32("SoftPackageReferencesCount");
        this.uasset.header.SoftPackageReferencesOffset = this.int32("SoftPackageReferencesOffset");
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_SEARCHABLE_NAMES.value) {
        this.uasset.header.SearchableNamesOffset = this.int32("SearchableNamesOffset");
    }

    this.uasset.header.ThumbnailTableOffset = this.int32("ThumbnailTableOffset");

    this.uasset.header.Guid = this.fguidString("Guid");

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_PACKAGE_OWNER.value) {
        this.uasset.header.PersistentGuid = this.fguidString("PersistentGuid");
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_PACKAGE_OWNER.value && this.uasset.header.FileVersionUE4 < EUnrealEngineObjectUE4Version.VER_UE4_NON_OUTER_PACKAGE_IMPORT.value) {
        this.uasset.header.OwnerPersistentGuid = this.fguidString("OwnerPersistentGuid");
    }

    count = this.int32("Generations Count");
    this.uasset.header.Generations = [];
    for (idx = 0; idx < count; ++idx) {
        this.uasset.header.Generations.push({
            exportCount: this.int32("Generations #" + idx + ": export count"),
            nameCount: this.int32("Generations #" + idx + ": name count)")
        });
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ENGINE_VERSION_OBJECT.value) {
        this.uasset.header.SavedByEngineVersion = String(this.uint16("SavedByEngineVersion Major"));
        this.uasset.header.SavedByEngineVersion = this.uasset.header.SavedByEngineVersion + "." + this.uint16("SavedByEngineVersion Minor");
        this.uasset.header.SavedByEngineVersion = this.uasset.header.SavedByEngineVersion + "." + this.uint16("SavedByEngineVersion Patch");
        this.uasset.header.SavedByEngineVersion = this.uasset.header.SavedByEngineVersion + "-" + this.uint32("SavedByEngineVersion Changelist");
        this.uasset.header.SavedByEngineVersion = this.uasset.header.SavedByEngineVersion + "+" + this.fstring("SavedByEngineVersion Branch");
    } else {
        this.uasset.header.EngineChangelist = this.int32("EngineChangelist");
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PACKAGE_SUMMARY_HAS_COMPATIBLE_ENGINE_VERSION.value) {
        this.uasset.header.CompatibleWithEngineVersion = String(this.uint16("CompatibleWithEngineVersion Major"));
        this.uasset.header.CompatibleWithEngineVersion = this.uasset.header.CompatibleWithEngineVersion + "." + this.uint16("CompatibleWithEngineVersion Minor");
        this.uasset.header.CompatibleWithEngineVersion = this.uasset.header.CompatibleWithEngineVersion + "." + this.uint16("CompatibleWithEngineVersion Patch");
        this.uasset.header.CompatibleWithEngineVersion = this.uasset.header.CompatibleWithEngineVersion + "-" + this.uint32("CompatibleWithEngineVersion Changelist");
        this.uasset.header.CompatibleWithEngineVersion = this.uasset.header.CompatibleWithEngineVersion + "+" + this.fstring("CompatibleWithEngineVersion Branch");
    } else {
        this.uasset.header.CompatibleWithEngineVersion = this.uasset.header.SavedByEngineVersion;
    }

    this.uasset.header.CompressionFlags = this.uint32("CompressionFlags");

    count = this.int32("CompressedChunks Count");
    if (count > 0) {
        return new Error("asset compressed");
    }

    this.uasset.header.PackageSource = this.uint32("PackageSource");

    count = this.uint32("AdditionalPackagesToCook Count");
    this.uasset.header.AdditionalPackagesToCook = [];
    if (count > 0) {
        return new Error("AdditionalPackagesToCook has items");
    }

    /* eslint-disable-next-line no-magic-numbers */
    if (this.uasset.header.LegacyFileVersion > -7) {
        this.uasset.header.NumTextureAllocations = this.int32("NumTextureAllocations");
    }

    this.uasset.header.AssetRegistryDataOffset = this.int32("AssetRegistryDataOffset");
    this.uasset.header.BulkDataStartOffset = this.int64("BulkDataStartOffset");

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_WORLD_LEVEL_INFO.value) {
        this.uasset.header.WorldTileInfoDataOffset = this.int32("WorldTileInfoDataOffset");
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_CHANGED_CHUNKID_TO_BE_AN_ARRAY_OF_CHUNKIDS.value) {
        count = this.int32("ChunkIDs Count");
        this.uasset.header.ChunkIDs = [];
        if (count > 0) {
            return new Error("ChunkIDs has items");
        }
    } else if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_CHUNKID_TO_ASSETDATA_AND_UPACKAGE.value) {
        this.uasset.header.ChunkID = this.int32("ChunkID");
    }

    if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PRELOAD_DEPENDENCIES_IN_COOKED_EXPORTS.value) {
        this.uasset.header.PreloadDependencyCount = this.int32("PreloadDependencyCount");
        this.uasset.header.PreloadDependencyOffset = this.int32("PreloadDependencyOffset");
    } else {
        this.uasset.header.PreloadDependencyCount = -1;
        this.uasset.header.PreloadDependencyOffset = 0;
    }

    if (this.uasset.header.FileVersionUE5 >= EUnrealEngineObjectUE5Version.VER_UE5_NAMES_REFERENCED_FROM_EXPORT_DATA.value) {
        this.uasset.header.NamesReferencedFromExportDataCount = this.int32("NamesReferencedFromExportDataCount");
    }

    if (this.uasset.header.FileVersionUE5 >= EUnrealEngineObjectUE5Version.VER_UE5_PAYLOAD_TOC.value) {
        this.uasset.header.PayloadTocOffset = this.int64("PayloadTocOffset");
    } else {
        this.uasset.header.PayloadTocOffset = -1;
    }

    if (this.uasset.header.FileVersionUE5 >= EUnrealEngineObjectUE5Version.VER_UE5_DATA_RESOURCES.value) {
        this.uasset.header.DataResourceOffset = this.int32("DataResourceOffset");
    }

    return undefined;
};

/**
 * Read Names.
 *
 * @function ReaderUasset#readNames
 * @returns {undefined}
 * @private
 * @see https://github.com/EpicGames/UnrealEngine/blob/5.0/Engine/Source/Runtime/Core/Private/UObject/UnrealNames.cpp#L2736
 */
ReaderUasset.prototype.readNames = function readNames() {
    var idx = 0;
    var count = this.uasset.header.NameCount;
    this.currentIdx = this.uasset.header.NameOffset;

    /**
     * Hashes: These are not used anymore but recalculated on save to maintain serialization format
     * GetRawNonCasePreservingHash -> return FCrc::Strihash_DEPRECATED(Source) & 0xFFFF;
     * GetRawCasePreservingHash -> return FCrc::StrCrc32(Source) & 0xFFFF;
     */

    for (; idx < count; ++idx) {
        this.uasset.names.push({
            Name: this.fstring("Name #" + (idx + 1) + ": string"),
            NonCasePreservingHash: this.uint16("Name #" + (idx + 1) + ": NonCasePreservingHash"),
            CasePreservingHash: this.uint16("Name #" + (idx + 1) + ": CasePreservingHash")
        });
    }
};

/**
 * Read Gatherable Text Data.
 *
 * @function ReaderUasset#readGatherableTextData
 * @returns {Error|undefined}
 * @private
 * @see https://github.com/EpicGames/UnrealEngine/blob/5.0/Engine/Source/Runtime/Core/Private/Internationalization/GatherableTextData.cpp
 */
ReaderUasset.prototype.readGatherableTextData = function readGatherableTextData() {
    /** @type {GatherableTextData} */
    var gatherableTextData;
    /** @type {SourceSiteContexts} */
    var sourceSiteContexts;
    /** @type {number} */
    var countSourceSiteContexts;
    /** @type {number} */
    var idxSourceSiteContexts;
    /** @type {number} */
    var idx = 0;
    /** @type {number} */
    var count = this.uasset.header.GatherableTextDataCount;

    this.currentIdx = this.uasset.header.GatherableTextDataOffset;

    this.uasset.gatherableTextData = [];
    for (; idx < count; ++idx) {
        gatherableTextData = {};

        gatherableTextData.NamespaceName = this.fstring("GatherableTextData #" + (idx + 1) + ": NamespaceName");

        gatherableTextData.SourceData = {
            SourceString: this.fstring("GatherableTextData #" + (idx + 1) + ": SourceData.SourceString"),
            SourceStringMetaData: {
                ValueCount: this.int32("GatherableTextData #" + (idx + 1) + ": SourceData.CountSourceStringMetaData"),
                Values: []
            }
        };

        if (gatherableTextData.SourceData.SourceStringMetaData.ValueCount > 0) {
            return new Error("unsupported SourceStringMetaData from readGatherableTextData");
        }

        gatherableTextData.SourceSiteContexts = [];
        countSourceSiteContexts = this.int32("GatherableTextData #" + (idx + 1) + ": CountSourceSiteContexts");
        for (idxSourceSiteContexts = 0; idxSourceSiteContexts < countSourceSiteContexts; ++idxSourceSiteContexts) {
            sourceSiteContexts = {};
            sourceSiteContexts.KeyName = this.fstring("GatherableTextData #" + (idx + 1) + " - SourceSiteContexts #" + (idxSourceSiteContexts + 1) + ": KeyName");
            sourceSiteContexts.SiteDescription = this.fstring("GatherableTextData #" + (idx + 1) + " - SourceSiteContexts #" + (idxSourceSiteContexts + 1) + ": SiteDescription");
            sourceSiteContexts.IsEditorOnly = this.uint32("GatherableTextData #" + (idx + 1) + " - SourceSiteContexts #" + (idxSourceSiteContexts + 1) + ": IsEditorOnly");
            sourceSiteContexts.IsOptional = this.uint32("GatherableTextData #" + (idx + 1) + " - SourceSiteContexts #" + (idxSourceSiteContexts + 1) + ": IsOptional");

            sourceSiteContexts.InfoMetaData = {
                ValueCount: this.int32("GatherableTextData #" + (idx + 1) + " - SourceSiteContexts #" + (idxSourceSiteContexts + 1) + ": CountInfoMetaData"),
                Values: []
            };

            if (sourceSiteContexts.InfoMetaData.ValueCount > 0) {
                return new Error("unsupported SourceSiteContexts.InfoMetaData from readGatherableTextData");
            }

            sourceSiteContexts.KeyMetaData = {
                ValueCount: this.int32("GatherableTextData #" + (idx + 1) + " - SourceSiteContexts #" + (idxSourceSiteContexts + 1) + ": CountKeyMetaData"),
                Values: []
            };

            if (sourceSiteContexts.KeyMetaData.ValueCount > 0) {
                return new Error("unsupported SourceSiteContexts.KeyMetaData from readGatherableTextData");
            }

            gatherableTextData.SourceSiteContexts.push(sourceSiteContexts);
        }

        this.uasset.gatherableTextData.push(gatherableTextData);
    }

    return undefined;
};

/**
 * Read Imports.
 *
 * @function ReaderUasset#readImports
 * @returns {undefined}
 * @private
 * @see https://github.com/EpicGames/UnrealEngine/blob/5.0/Engine/Source/Runtime/CoreUObject/Private/UObject/ObjectResource.cpp#L302
 */
ReaderUasset.prototype.readImports = function readImports() {
    var idx = 0;
    /** @type {number} */
    var classPackage;
    /** @type {number} */
    var className;
    /** @type {number} */
    var outerIndex;
    /** @type {number} */
    var objectName;
    /** @type {number} */
    var packageName = 0;
    /** @type {number} */
    var bImportOptional = 0;
    /** @type {number} */
    var count = this.uasset.header.ImportCount;

    this.currentIdx = this.uasset.header.ImportOffset;

    this.uasset.imports.Imports = [];
    for (; idx < count; ++idx) {
        classPackage = this.uint64("Import #" + (idx + 1) + ": classPackage");
        className = this.uint64("Import #" + (idx + 1) + ": className");
        outerIndex = this.int32("Import #" + (idx + 1) + ": outerIndex");
        objectName = this.uint64("Import #" + (idx + 1) + ": objectName");

        if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_NON_OUTER_PACKAGE_IMPORT.value) {
            packageName = this.uint64("Import #" + (idx + 1) + ": packageName");
        }

        if (this.uasset.header.FileVersionUE5 >= EUnrealEngineObjectUE5Version.VER_UE5_OPTIONAL_RESOURCES.value) {
            bImportOptional = this.int32("Import #" + (idx + 1) + ": importOptional");
        }

        this.uasset.imports.Imports.push({
            classPackage: this.resolveFName(classPackage),
            className: this.resolveFName(className),
            outerIndex: outerIndex,
            objectName: this.resolveFName(objectName),
            packageName: this.resolveFName(packageName),
            bImportOptional: bImportOptional
        });
    }
};

/**
 * Read Exports.
 *
 * @function ReaderUasset#readExports
 * @returns {undefined}
 * @private
 * @see https://github.com/EpicGames/UnrealEngine/blob/5.0/Engine/Source/Runtime/CoreUObject/Private/UObject/ObjectResource.cpp#L113
 * @todo Data are HERE, need to find how to read that
 */
/* eslint-disable-next-line max-statements */
ReaderUasset.prototype.readExports = function readExports() {
    /** @type {number} */
    var idx = 0;
    /** @type {number} */
    var count;
    /** @type {number} */
    var nodeNameRef;
    /** @type {number} */
    var classIndex;
    /** @type {number} */
    var superIndex;
    /** @type {number} */
    var templateIndex = 0;
    /** @type {number} */
    var outerIndex;
    /** @type {number} */
    var objectName;
    /** @type {number} */
    var objectFlags;
    /** @type {number} */
    var serialSize;
    /** @type {number} */
    var serialOffset;
    /** @type {number} */
    var bForcedExport;
    /** @type {number} */
    var bNotForClient;
    /** @type {number} */
    var bNotForServer;
    /** @type {string} */
    var packageGuid;
    /** @type {number} */
    var packageFlags;
    /** @type {number} */
    var bNotAlwaysLoadedForEditorGame = 0;
    /** @type {number} */
    var bIsAsset = 0;
    /** @type {number} */
    var bGeneratePublicHash = 0;
    /** @type {number} */
    var firstExportDependency = 0;
    /** @type {number} */
    var serializationBeforeSerializationDependencies = 0;
    /** @type {number} */
    var createBeforeSerializationDependencies = 0;
    /** @type {number} */
    var serializationBeforeCreateDependencies = 0;
    /** @type {number} */
    var createBeforeCreateDependencies = 0;

    this.currentIdx = this.uasset.header.ExportOffset;

    count = this.uasset.header.ExportCount;
    this.uasset.exports = [];
    for (; idx < count; ++idx) {
        classIndex = this.int32("Export #" + (idx + 1) + ": classIndex");
        superIndex = this.int32("Export #" + (idx + 1) + ": superIndex");

        if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_TEMPLATEINDEX_IN_COOKED_EXPORTS.value) {
            templateIndex = this.int32("Export #" + (idx + 1) + ": templateIndex");
        }

        outerIndex = this.int32("Export #" + (idx + 1) + ": outerIndex");
        objectName = this.uint64("Export #" + (idx + 1) + ": objectName");
        objectFlags = this.uint32("Export #" + (idx + 1) + ": objectFlags");
        serialSize = this.int64("Export #" + (idx + 1) + ": serialSize");
        serialOffset = this.int64("Export #" + (idx + 1) + ": serialOffset");
        bForcedExport = this.int32("Export #" + (idx + 1) + ": bForcedExport");
        bNotForClient = this.int32("Export #" + (idx + 1) + ": bNotForClient");
        bNotForServer = this.int32("Export #" + (idx + 1) + ": bNotForServer");
        packageGuid = this.fguidString("Export #" + (idx + 1) + ": packageGuid");
        packageFlags = this.uint32("Export #" + (idx + 1) + ": packageFlags");

        if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_LOAD_FOR_EDITOR_GAME.value) {
            bNotAlwaysLoadedForEditorGame = this.int32("Export #" + (idx + 1) + ": bNotAlwaysLoadedForEditorGame");
        }

        if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_COOKED_ASSETS_IN_EDITOR_SUPPORT.value) {
            bIsAsset = this.int32("Export #" + (idx + 1) + ": bIsAsset");
        }

        if (this.uasset.header.FileVersionUE5 >= EUnrealEngineObjectUE5Version.VER_UE5_OPTIONAL_RESOURCES.value) {
            bGeneratePublicHash = this.int32("Export #" + (idx + 1) + ": bGeneratePublicHash");
        }

        if (this.uasset.header.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PRELOAD_DEPENDENCIES_IN_COOKED_EXPORTS.value) {
            firstExportDependency = this.int32("Export #" + (idx + 1) + ": firstExportDependency");
            serializationBeforeSerializationDependencies = this.int32("Export #" + (idx + 1) + ": serializationBeforeSerializationDependencies");
            createBeforeSerializationDependencies = this.int32("Export #" + (idx + 1) + ": createBeforeSerializationDependencies");
            serializationBeforeCreateDependencies = this.int32("Export #" + (idx + 1) + ": serializationBeforeCreateDependencies");
            createBeforeCreateDependencies = this.int32("Export #" + (idx + 1) + ": createBeforeCreateDependencies");
        }

        this.uasset.exports.push({
            classIndex: classIndex,
            superIndex: superIndex,
            templateIndex: templateIndex,
            outerIndex: outerIndex,
            objectName: this.resolveFName(objectName),
            objectFlags: objectFlags,
            serialSize: serialSize,
            serialOffset: serialOffset,
            bForcedExport: bForcedExport,
            bNotForClient: bNotForClient,
            bNotForServer: bNotForServer,
            packageGuid: packageGuid,
            packageFlags: packageFlags,
            bNotAlwaysLoadedForEditorGame: bNotAlwaysLoadedForEditorGame,
            bIsAsset: bIsAsset,
            bGeneratePublicHash: bGeneratePublicHash,
            firstExportDependency: firstExportDependency,
            serializationBeforeSerializationDependencies: serializationBeforeSerializationDependencies,
            createBeforeSerializationDependencies: createBeforeSerializationDependencies,
            serializationBeforeCreateDependencies: serializationBeforeCreateDependencies,
            createBeforeCreateDependencies: createBeforeCreateDependencies,
            data: []
        });
    }

    for (idx = 0; idx < count; ++idx) {
        if (this.uasset.exports[idx].serialSize <= 0) {
            continue;
        }

        this.currentIdx = Number(this.uasset.exports[idx].serialOffset);

        // Data are HERE, need to find how to read that

        nodeNameRef = this.uint64("Exports #" + (idx + 1) + ": data");
        this.uasset.exports[idx].data.push(this.resolveFName(nodeNameRef));
        this.uasset.exports[idx].data.push(this.uint32("flags"));
    }
};

/**
 * Read Depends.
 *
 * @function ReaderUasset#readDepends
 * @returns {undefined}
 * @private
 */
ReaderUasset.prototype.readDepends = function readDepends() {
    /** @type {number} */
    var idx = 0;
    /** @type {number} */
    var count;

    this.currentIdx = this.uasset.header.DependsOffset;

    count = this.int32("Depends Count");
    this.uasset.depends.Depends = [];
    for (; idx < count; ++idx) {
        this.uasset.depends.Depends.push({
            FPackageIndex: this.int32("Depend #" + (idx + 1) + ": FPackageIndex")
        });
    }
};

/**
 * Read Soft Package References.
 *
 * @function ReaderUasset#readSoftPackageReferences
 * @returns {undefined}
 * @private
 */
ReaderUasset.prototype.readSoftPackageReferences = function readSoftPackageReferences() {
    /** @type {number} */
    var nameIndex;
    /** @type {number} */
    var idx = 0;
    /** @type {number} */
    var count;

    this.currentIdx = this.uasset.header.SoftPackageReferencesOffset;

    count = this.uasset.header.SoftPackageReferencesCount;
    this.uasset.softPackageReferences = [];
    for (; idx < count; ++idx) {
        nameIndex = this.uint64("SoftPackageReferences #" + (idx + 1) + ": SoftPackageReferences");
        this.uasset.softPackageReferences.push({
            assetPathName: this.resolveFName(nameIndex)
        });
    }
};

/**
 * Read Searchable Names.
 *
 * @function ReaderUasset#readSearchableNames
 * @returns {undefined}
 * @private
 */
ReaderUasset.prototype.readSearchableNames = function readSearchableNames() {
    this.currentIdx = this.uasset.header.SearchableNamesOffset;

    this.int32("CountSearchableNames");
    this.uasset.searchableNames = [];
};

/**
 * Read Thumbnails.
 *
 * @function ReaderUasset#readThumbnails
 * @returns {undefined}
 * @private
 * @see https://github.com/EpicGames/UnrealEngine/blob/5.0/Engine/Source/Runtime/Core/Private/Misc/ObjectThumbnail.cpp#L42
 */
ReaderUasset.prototype.readThumbnails = function readThumbnails() {
    /** @type {number} */
    var pos;
    /** @type {number} */
    var idx = 0;
    /** @type {number} */
    var count;
    /** @type {number} */
    var imageWidth;
    /** @type {number} */
    var imageHeight;
    /** @type {string} */
    var imageFormat;
    /** @type {number} */
    var imageSizeData;
    /** @type {number[]} */
    var imageData;

    this.currentIdx = this.uasset.header.ThumbnailTableOffset;

    count = this.int32("Thumbnails Count");
    this.uasset.thumbnails.Index = [];
    this.uasset.thumbnails.Thumbnails = [];
    for (; idx < count; ++idx) {
        this.uasset.thumbnails.Index.push({
            AssetClassName: this.fstring("Thumbnails #" + (idx + 1) + ": assetClassName"),
            ObjectPathWithoutPackageName: this.fstring("Thumbnails #" + (idx + 1) + ": objectPathWithoutPackageName"),
            FileOffset: this.int32("Thumbnails #" + (idx + 1) + ": fileOffset")
        });
    }

    for (idx = 0; idx < count; ++idx) {
        this.currentIdx = this.uasset.thumbnails.Index[idx].FileOffset;

        imageWidth = this.int32("Thumbnails #" + (idx + 1) + ": imageWidth");
        imageHeight = this.int32("Thumbnails #" + (idx + 1) + ": imageHeight");
        imageFormat = "PNG";

        if (imageHeight < 0) {
            imageFormat = "JPEG";
            imageHeight = imageHeight * -1;
        }

        imageData = [];
        imageSizeData = this.int32("Thumbnails #" + (idx + 1) + ": imageSizeData");
        if (imageSizeData > 0) {
            pos = this.currentIdx;
            imageData = this.readCountBytes(imageSizeData);
            this.addHexView("Thumbnails #" + (idx + 1) + ": imageData", "data", imageData.join(""), pos, this.currentIdx - 1);
        }

        this.uasset.thumbnails.Thumbnails.push({
            ImageWidth: imageWidth,
            ImageHeight: imageHeight,
            ImageFormat: imageFormat,
            ImageSizeData: imageSizeData,
            ImageData: imageData
        });
    }
};

/**
 * Read Asset Registry Data.
 *
 * @function ReaderUasset#readAssetRegistryData
 * @returns {undefined}
 * @private
 */
ReaderUasset.prototype.readAssetRegistryData = function readAssetRegistryData() {
    /** @type {number} */
    var idx;
    /** @type {number} */
    var count;
    /** @type {number} */
    var idxTag;
    /** @type {number} */
    var countTag;
    /** @type {number} */
    var nextOffset = this.uasset.header.TotalHeaderSize;

    this.currentIdx = this.uasset.header.AssetRegistryDataOffset;

    if (this.uasset.header.WorldTileInfoDataOffset > 0) {
        nextOffset = this.uasset.header.WorldTileInfoDataOffset;
    }

    this.uasset.assetRegistryData.size = nextOffset - this.uasset.header.AssetRegistryDataOffset;

    this.uasset.assetRegistryData.DependencyDataOffset = this.int64("DependencyDataOffset");

    this.uasset.assetRegistryData.data = [];
    count = this.int32("AssetRegistryData Count");
    for (idx = 0; idx < count; ++idx) {
        this.uasset.assetRegistryData.data.push({
            ObjectPath: this.fstring("ObjectPath"),
            ObjectClassName: this.fstring("ObjectClassName"),
            Tags: []
        });

        countTag = this.int32("AssetRegistryData Tag Count");
        for (idxTag = 0; idxTag < countTag; ++idxTag) {
            this.uasset.assetRegistryData.data[idx].Tags.push({
                Key: this.fstring("key"),
                Value: this.fstring("value")
            });
        }
    }
};

/**
 * Read Preload Dependency.
 *
 * @function ReaderUasset#readPreloadDependency
 * @returns {undefined}
 * @private
 */
ReaderUasset.prototype.readPreloadDependency = function readPreloadDependency() {
    this.currentIdx = this.uasset.header.PreloadDependencyOffset;
};

/**
 * Read Bulk Data Start.
 *
 * @function ReaderUasset#readBulkDataStart
 * @returns {undefined}
 * @private
 */
ReaderUasset.prototype.readBulkDataStart = function readBulkDataStart() {
    this.currentIdx = Number(this.uasset.header.BulkDataStartOffset);
};

/**
 * Analyze Uasset.
 *
 * @function ReaderUasset#analyze
 * @param {Uint8Array} bytes       - bytes read from file
 * @param {boolean}    saveHexView - if true save all informations to debug
 * @returns {(Error|Uasset)}
 * @public
 */
ReaderUasset.prototype.analyze = function analyze(bytes, saveHexView) {
    /** @type {(Error|undefined)} */
    var err;

    this.currentIdx = 0;
    this.bytes = bytes;
    this.saveHexView = saveHexView || false;
    this.useLittleEndian = true;

    err = this.readHeader();
    if (err !== undefined) {
        return err;
    }

    this.readNames();

    err = this.readGatherableTextData();
    if (err !== undefined) {
        return err;
    }

    this.readImports();
    this.readExports();
    this.readDepends();
    this.readSoftPackageReferences();
    this.readSearchableNames();
    this.readThumbnails();
    this.readAssetRegistryData();
    this.readPreloadDependency();
    this.readBulkDataStart();

    this.uasset.hexView.sort(function sortHexView(left, right) {
        return left.start - right.start;
    });

    return this.uasset;
};

// Freeze prototype for security issue about prototype pollution.
Object.freeze(ReaderUasset.prototype);
Object.freeze(ReaderUasset);

window.blueprintUE.uasset.ReaderUasset = ReaderUasset;
