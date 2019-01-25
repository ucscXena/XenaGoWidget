export default[
    {
        "TCGA Liver Cancer (LIHC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LIHC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LIHC.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LIHC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LIHC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Cervical Cancer (CESC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.CESC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.CESC.sampleMap/mutation_curated_wustl"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.CESC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.CESC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Sarcoma (SARC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.SARC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.SARC.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.SARC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.SARC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Thymoma (THYM)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.THYM.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.THYM.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.THYM.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.THYM.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Mesothelioma (MESO)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.MESO.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.MESO.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.MESO.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.MESO.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Pancreatic Cancer (PAAD)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PAAD.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PAAD.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PAAD.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PAAD.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Ocular melanomas (UVM)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UVM.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UVM.sampleMap/mutation_curated_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UVM.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UVM.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Rectal Cancer (READ)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.READ.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.READ.sampleMap/mutation_bcm"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.READ.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.READ.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Lung Squamous Cell Carcinoma (LUSC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LUSC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LUSC.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LUSC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LUSC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Stomach Cancer (STAD)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.STAD.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.STAD.sampleMap/mutation_curated_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.STAD.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.STAD.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Colon Cancer (COAD)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.COAD.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.COAD.sampleMap/mutation_bcm"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.COAD.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.COAD.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Lower Grade Glioma (LGG)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LGG.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LGG.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LGG.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LGG.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Thyroid Cancer (THCA)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.THCA.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.THCA.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.THCA.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.THCA.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Kidney Chromophobe (KICH)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KICH.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KICH.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KICH.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KICH.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Kidney Papillary Cell Carcinoma (KIRP)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KIRP.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KIRP.sampleMap/mutation_bcm"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KIRP.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KIRP.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Bile Duct Cancer (CHOL)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.CHOL.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.CHOL.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.CHOL.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.CHOL.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Glioblastoma (GBM)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.GBM.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.GBM.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.GBM.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.GBM.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Lung Adenocarcinoma (LUAD)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LUAD.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LUAD.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LUAD.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LUAD.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Ovarian Cancer (OV)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.OV.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.OV.sampleMap/mutation_wustl"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.OV.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.OV.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Kidney Clear Cell Carcinoma (KIRC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KIRC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KIRC.sampleMap/mutation_bcm"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KIRC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.KIRC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Endometrioid Cancer (UCEC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UCEC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UCEC.sampleMap/mutation_wustl"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UCEC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UCEC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Head and Neck Cancer (HNSC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.HNSC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.HNSC.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.HNSC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.HNSC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Adrenocortical Cancer (ACC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.ACC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.ACC.sampleMap/mutation_curated_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.ACC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.ACC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Prostate Cancer (PRAD)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PRAD.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PRAD.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PRAD.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PRAD.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Uterine Carcinosarcoma (UCS)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UCS.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UCS.sampleMap/mutation_curated_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UCS.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.UCS.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Melanoma (SKCM)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.SKCM.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.SKCM.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.SKCM.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.SKCM.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Pheochromocytoma & Paraganglioma (PCPG)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PCPG.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PCPG.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PCPG.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.PCPG.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Breast Cancer (BRCA)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.BRCA.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.BRCA.sampleMap/mutation_curated_wustl"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.BRCA.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.BRCA.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Testicular Cancer (TGCT)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.TGCT.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.TGCT.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.TGCT.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.TGCT.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Acute Myeloid Leukemia (LAML)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LAML.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LAML.sampleMap/mutation_wustl"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LAML.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.LAML.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Large B-cell Lymphoma (DLBC)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.DLBC.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.DLBC.sampleMap/mutation_bcm"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.DLBC.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.DLBC.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Bladder Cancer (BLCA)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.BLCA.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.BLCA.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.BLCA.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.BLCA.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "TCGA Esophageal Cancer (ESCA)": {
            "gene expression": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.ESCA.sampleMap/HiSeqV2"
            },
            "simple somatic mutation": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.ESCA.sampleMap/mutation_broad"
            },
            "copy number": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.ESCA.sampleMap/SNP6_nocnv_genomicSegment"
            },
            "copy number for pathway view": {
                "host": "https://tcga.xenahubs.net",
                "dataset": "TCGA.ESCA.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    },
    {
        "Cancer Cell Line Encyclopedia (Breast)": {
            "copy number": {
                "host": "https://ucscpublic.xenahubs.net",
                "dataset": "ccle/nobulkdownload/CCLE_copynumber_byGene_2013-12-03_breast"
            },
            "simple somatic mutation": {
                "host": "https://ucscpublic.xenahubs.net",
                "dataset": "ccle/CCLE_DepMap_18Q2_maf_20180502_breast"
            },
            "copy number for pathway view": {
                "host": "https://ucscpublic.xenahubs.net",
                "dataset": "ccle/nobulkdownload/CCLE_copynumber_byGene_2013-12-03_breast",
                "amplificationThreshold": 2,
                "deletionThreshold": -2
            },
            "genome_background": {
                "copy number": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "cnv_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                },
                "mutation": {
                    "host": "https://xenago.xenahubs.net",
                    "dataset": "mutation_sampleEvent",
                    "feature_genome_event_K": "genome_event_K",
                    "feature_total_pop_N": "total_pop_N"
                }
            },
            "viewInPathway": true
        }
    }
];
