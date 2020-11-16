import expect from 'expect'
// import {calculateCustomGeneSetActivity, getSamples} from '../../src/service/AnalysisService'
import {
  createMeanMap,
  getDataStatistics,
  getGeneSetNames,
  getSamples,
  getValues
} from '../../src/service/AnalysisService'
import TEST_ANALYZED_DATA from '../data/AnalzedTestData'


describe('Analysis Service Test', () => {

  beforeEach(function(done) {
    sessionStorage.clear()
    window.setTimeout(function() {
      done()
    }, 0)
  })

  // it('Convert gmt and analyzed data into gene set', () => {
  //   const outputData = calculateGeneSetActivity(TEST_SELECTED_COHORTS,TEST_GMT_DATA,TEST_ANALYZED)
  //   // console.log(JSON.stringify(outputData))
  //   // expect(outputData!==null)
  // })
  //
  // it('Create mean maps with ZScore', () => {
  //   const inputValues = [14.1672, 13.9714, 15.1691, 15.449, 14.8068, 13.6556, 15.5381, 14.996, 15.4449, 14.9837, 14.0538, 14.8852, 14.1656, 15.855, 15.0555, 13.7733, 15.1556, 13.6874, 15.0858, 14.8161, 15.8089, 15.9541, 15.3173, 13.1746, 15.4854, 15.8444, 14.5385, 15.5576, 15.0205, 15.0058, 15.8734, 15.1135, 12.8538, 14.615, 13.8569, 14.2372, 14.6272, 14.6241, 15.2983, 15.4395, 14.7171, 14.4599];
  // })

  it('Get gene set names', () => {
    const geneSetNames = getGeneSetNames(TEST_ANALYZED_DATA)
    expect(geneSetNames.length).toEqual(50)
    expect(geneSetNames[0]).toEqual('HALLMARK_TNFA_SIGNALING_VIA_NFKB')
    expect(geneSetNames[49]).toEqual('HALLMARK_PANCREAS_BETA_CELLS')
  })

  it('Get samples', () => {
    const samples = getSamples(TEST_ANALYZED_DATA)
    expect(samples.length).toEqual(379)
    expect(samples[0]).toEqual('TCGA.04.1331.01')
    expect(samples[378]).toEqual('TCGA.WR.A838.01')
  })

  it('Get values', () => {
    const values = getValues(TEST_ANALYZED_DATA)
    expect(values.length).toEqual(379)
    expect(values[0]).toEqual(17.5313)
    expect(values[378]).toEqual(16.6648)
  })

  it('Get data statistics', () => {
    const values = getValues(TEST_ANALYZED_DATA)
    expect(values.length).toEqual(379)
    const {mean, variance} = getDataStatistics(values)
    expect(Math.abs(mean-18.539003693931388)).toBeLessThan(0.0000001)
    expect(Math.abs(variance-2.301772809115643)).toBeLessThan(0.0000001)
  })


  // it('Create mean map', () => {
  //   const returnMap = createMeanMap([TEST_ANALYZED_DATA,TEST_ANALYZED_DATA])
  //   console.log('return map',returnMap)
  // })
})



const TEST_GMT_DATA = 'Notch signaling\tGO:0007219\tDLL1\tDTX1\tJAG1\tJAG2\tADAM10\tPSEN1\tPSEN2\tPSENEN\n' +
  'Hippo signaling\tGO:0035329\tLATS2\tMOB1B\tMOB1A\tSAV1\tSTK3\tSTK4\tTAZ\tYAP1\tMST1\tWWTR1\n' +
  'DNA base excision repair\tGO:0006281\tUNG\tSMUG1\tMBD4\tTDG\tOGG1\tMUTYH\tNTHL1\tMPG\tNEIL1\tNEIL2\tNEIL3\n' +
  'DNA strand break joining\tGO:0006281\tAPEX1\tAPEX2\tLIG3\tXRCC1\tPNKP\tAPLF\n' +
  'Poly(ADP-ribose) polymerase (PARP)\tGO:0006281\tPARP1\tPARP2\tPARP3\n' +
  'Direct reversal of DNA damage\tGO:0006281\tMGMT\tALKBH2\tALKBH3\n' +
  'Repair of DNA-topoisomerase crosslinks\tGO:0006281\tTDP1\tTDP2\n' +
  'Mismatch excision repair\tGO:0006281\tMSH2\tMSH3\tMSH6\tMLH1\tPMS2\tMSH4\tMSH5\tMLH3\tPMS1\tPMS2L3\n' +
  'Nucleotide excision repair\tGO:0006281\tXPC\tRAD23B\tCETN2\tRAD23A\tXPA\tDDB1\tDDB2\tRPA1\tRPA2\tRPA3\tTFIIH\tERCC3\tERCC2\tGTF2H1\tGTF2H2\tGTF2H3\tHTF2H4\tGTF2H5\tCDK7\tCCNH\tMNAT1\tERCC5\t34CC1\tERCC4\tLIG1\tNER-related\tERCC8\tE4CC6\tUVSSA\tXAB2\tMMS19\n' +
  'Homologous recombination\tGO:0006281\tRAD51\tRAD51B\tRAD51D\tDMC1\tXRCC2\tXRCC3\tRAD52\tRAD54L\tRAD54B\tBRCA1\tSHFM1\tRAD50\tMRE11A\tNBN\tRBBP8\tMUS81\tEME1\tEME2\tGIYD1\tGIYD2\tGEN1\n' +
  'Fanconi anemia\tGO:0006281\tFANCA\tFANCB\tFANCC\tBRCA2\tFANCD2\tFANCE\tFANCF\tFANCG\tFANCI\tBRIP1\tFANCL\tFANCM\tPALB2\tRAD51C\tBTBD12\tFAAP20\tFAAP24\n' +
  'Non-homologous DNA end-joining\tGO:0006281\tXRCC6\tXRCC5\tPRKDC\tLIG4\tXRCC4\tDCLRE1C\tNHEJ1\n' +
  'Modulation of nucleotide pools\tGO:0006281\tNUDT1\tDUT\tRRM2B\n' +
  'DNA polymerase\tGO:0006281\tPOLB\tPOLG\tPOLD1\tPOLE\tPCNA\tREV3L\tMAD2L2\tREV1L\tPOLH\tPOLI\tPOLQ\tPOLK\tPOLL\tPOLM\tPOLN\n' +
  'Editing and processing nucleases\tGO:0006281\tFEN1\tFAN1\tTREX1\tTREX2\tEXO1\tAPTX\tSPO11\tENDOV\n' +
  'Ubiquitination and modification\tGO:0006281\tUBE2A\tUBE2B\tRAD18\tSHPRH\tHLTF\tRNF168\tSPRTN\tRNF8\tRNF4\tUBE2V2\tUBE2N\n' +
  'Chromatin structure and modification\tGO:0006281\tH2AFX\tCHAF1A\tSETMAR\n' +
  'Sensitivity to DNA damaging agents\tGO:0006281\tBLM\tWRN\tRECQL4\tATM\tTTDN1\n' +
  'Known/suspected DNA repair function\tGO:0006281\tDCLRE1A\tDCLRE1B\tRPA4\tPRPF19\tRECQL\tRECQL5\tHELQ\tRDM1\tOBFC2B\n' +
  'Conserved DNA damage response\tGO:0006281\tATR\tATRIP\tMDC1\tRAD1\tRAD9A\tHUS1\tRAD17\tCHEK1\tCHEK2\tTP53\tTP53BP1\tRIF1\tTOPBP1\tCLK2\tPER1\n' +
  'DNA damage checkpoint\tGO:0000077\tTAOK1\tRPL26\tDONSON\tTIPIN\tDDX39B\tFBXO31\tSOX4\tHINFP\tCCND1\tWAC\tETAA1\tBABAM2\tUSP28\tUIMC1\tCDC14B\tRHNO1\tBRCC3\tFOXN3\tCLSPN\tCRADD\tTHOC5\tFEM1B\tPIDD1\tABRAXAS1\tBRSK1\tCCAR2\tCDC5L\tPLK1\tRPS27L\tCDKN1A\tTAOK2\tFZR1\tHMGA2\tMRNIP\tCLOCK\tNOP53\tE2F1\tTHOC1\tCASP2\tRFWD3\tNEK11\tMUC1\tMAP3K20\tTAOK3\tCDK5RAP3\tTIPRL\tINTS7\tBABAM1\tMDM2\tDTL\tATF2\n' +
  'PI3-K signaling\tGO:0048017\tAKT1\tAKT2\tAKT3\tBTK\tGRB10\tGRB2\tHSPB1\tILK\tMTCP1\tPDK2\tPDPK1\tPIK3CA\tPIK3CG\tPIK3R1\tPIK3R2\tPAK1\tPRKCA\tPRKCB\tPRKCZ\tPTEN\tTCL1A\n' +
  'Wnt signaling\tGO:0016055\tAES\tAPC\tAXIN1\tBCL9\tCSNK1A1\tCSNK1D\tCSNK1G1\tCSNK2A1\tCTBP1\tCTBP2\tCTNNB1\tCTNNBIP1\tCXXC4\tDIXDC1\tDKK1\tDVL1\tDVL2\tEP300\tFRAT1\tFZD1\tFZD2\tFZD3\tFZD4\tFZD5\tFZD6\tFZD7\tFZD8\tGSK3A\tGSK3B\tLEF1\tLRP5\tLRP6\tNKD1\tPORCN\tPPP2CA\tPPP2R1A\tPYGO1\tSENP2\tSFRP1\tSFRP4\tSOX17\tTCF7\tTCF7L1\tWIF1\tWNT1\tWNT10A\tWNT16\tWNT2\tWNT2B\tWNT3\tWNT3A\tWNT4\tWNT6\tWNT7A\tWNT7B\tWNT8A\n' +
  'Intrinsic apoptotic pathway\tGO:0097193\tPTTG1IP\tCHEK2\tNONO\tDDIAS\tMOAP1\tLRRK2\tYBX3\tS1OOAO\tLGALS12\tLCK\tRPL26\tCAV1\tSOD1\tDAPK2\tHERPUD1\tUBB\tTP53\tMYBBP1A\tSELENOS\tPLAUR\tPRKN\tTP53BP2\tSYVN1\tMPAK7\tMIF\tSRC\tTRIM32\tTP73\tCHAC1\tNOL3\tUSP28\tZNF385A\tSNW1\tCDKN2D\tRPS3\tCASP9\tPMAIP1\tSIAH1\tMMP9\tSFPQ\tEPO\tTMBIM6\tHYOU1\tBAD\tDNAJC10\tCCAR2\tMAGEA3\tSFN\tPARK7\tMAP3K5\tENO1\tMSX1\tSTK25\tSTK11\tRACK1\tDNAJA1\tBRCA1\tPHLDA3\tRPS27L\tEP300\tDDIT3\tPDK2\tPDK1\tCXCL12\tURI1\tBRSK2\tBCAP31\tTNFRSF10B\tMLLT11\tCRIP1\tNCK1\tTPT1\tHSPA1A\tCASP4\tIFI16\tHIF1A\tKDM1A\tOPA1\tCYLD\tEPHA2\tPPP1R13B\tBCL2L11\tTRIAP1\tPPM1F\tHTRA2\tCREB3\tCLU\tPINK1\tSLC9A3R1\tCDIP1\tCD74\tBOK\tUBQLN1\tESF1\tSEPT4\tFHIT\tHINT1\tXBP1\tDDX5\tARL6IP5\tP4HB\tBCL3\tFIS1\tTMEM117\tSNAI2\tNACC2\tBNIP3\tGSDME\tIKBKE\tTOPORS\tGSKIP\tNDUFA13\tSNAI1\tSTK24\tNFE2L2\tFBXO18\tBCL2\tSIRT1\tMUC1\tSELENOK\tZNF385B\tBAG6\tEIF2AK3\tDYRK2\tRRP8\tHIC1\tBAG5\tPYCARD\tTXNDC12\tNOC2L\tNKX3-1\tAEN\tMCL1\tBCL2L1\tBAX\tATP2A1\tURS00003D1AE3_9606\tNDUFS3\tDNM1L\tTMEM161A\tTRIB3\tPDCD10\tMDM2\tDDX3X\tBCLAF1\tZNF622\tCD44\tFBXW7\tPPIF\tACKR3\tS100A8\n' +
  'Extrinsic apoptotic pathway\tGO:0097191\tHIPK1\tSORT1\tMOAP1\tBAG3\tPELI3\tERBB3\tITGAV\tDEDD2\tFAIM2\tPSME3\tCAV1\tTLR3\tTRAF1\tHMOX1\tPTEN\tGSTP1\tGDNF\tTHBS1\tTMC8\tIFI6\tRIPK1\tPAK2\tMAPK7\tFADD\tBID\tSRC\tNOL3\tFGG\tFGB\tFGA\tSH3RF1\tINHBA\tPMAIP1\tDEPTOR\tIL1B\tIFNG\tSFRP1\tFEM1B\tTNFAIP3\tAGT\tBAD\tPARK7\tLTBR\tUNC5B\tTNF\tZMYND11\tTGFBR1\tACVR1B\tMADD\tFAS\tHTT\tPHIP\tBRCA1\tPPP2R1B\tKIAAO141\tTIMP3\tTNFSF10\tTRAF2\tPEA15\tTGFB2\tFASLG\tTNFRSF10A\tITGA6\tTERT\tMLLT11\tCSF2\tHSPA1A\tCD70\tBIRC6\tICAM1\tCYLD\tFGFR3\tLGALS3\tDDX47\tBCL10\tHTRA2\tCASP8AP2\tDAB2IP\tPDPK1\tRNF41\tSIAH2\tG0S2\tGPX1\tSERPINE1\tPML\tIL12A\tATF3\tSP100\tACVR1\tBCL2\tGATA1\tCASP8\tHSPA1B\tRELA\tTNFRSF12A\tPYCARD\tTNFSF12\tBLOC1S2\tAR\tSMAD3\tTRADD\tMCL1\tBCL2L1\tBAX\tSCG2\tSIVA1\tURS00002C6949_9606\tNGF\tTGFB1\tCD27\tRFFL\tGABARAP\tAGTR2\tDDX3X\tSTX4\tPF4\tTMBIM1\tRNF34\tCFLAR\tIGF1\n' +
  'Cell cycle\tGO:0022402\tGSK3B\tTGFB1\tSMAD3\tSMAD4\tCD2A2\tCDN1B\tCCND3\tCCND2\tCDK4\tCDK6\tSCF\tSKP2\tABL1\tHDAC1\tHDAC2\tHDAC3\tHDAC4\tHDAC5\tHDAC6\tHDAC7\tHDAC8\tRB\tE2F1\tE2F2\tE2F3\tE2F4\tE2F5\tE2F6\tRBL1\tUBE2F\tTFDP1\tCCNE1\tCCNE2\tCDK2\tCDN1A\tCCNA1\tCCNA2\tCCNH\tCDC6\tORC1\tORC2\tORC3\tORC4\tORC5\tORC6\tCDC45\tARF1\tMDM2\tP53\tEP000\tPRKDC\tGA45A\t1433G\tPCNA\tMPIP1\tATR\tATM\tCHK1\tCHK2\tCDK1\tCCNB1\tCCNB2\tCCNB3\tWEE1\tPMYT1\tMCM2\tMCM3\tMCM4\tMCM5\tMCM6\tMCM7\tMCM8\tMCM9\tMCM10\tCDC7\tDBF4A\tPLK1\tAPC\tCADH1\tCC14A\tCC14B\tMEN1\tMPIP2\tMPIP3\tYWHAB\tYWHAE\tYWHAG\tYWHAH\tYWHAQ\tYWHAZ\tBUB1\tBUB3\tMPEG1\tBUB1B\tMD1L1\tMD2L2\tMD2L1\tSMC1A\tESPL1\tPTTG3\tPTTG2\tPTTG1\n' +
  'Histone modification\tGO:0016570\tKANSL1\tKDM5A\tCTCFL\tKAT2A\tUBE2B\tUSP3\tEYA3\tEYA1\tDOT1L\tRBBP5\tACTL6A\tWDR5\tKDM8\tSETD6\tMIER2\tBAP1\tHASPIN\tUSP49\tMSL2\tELK4\tTAF7\tTAF5\tLEO1\tUBE2E1\tNCOA3\tKMT2A\tPHF19\tCTBP1\tMSL1\tUHRF1\tSETDB2\tSIN3A\tIWS1\tBEND3\tPHF20\tHAT1\tHDAC3\tDNMT1\tSART3\tEYA2\tKDM5C\tWBP2\tKAT14\tATXN7L3\tPADI2\tKAT8\tNAA60\tCTR9\tCDK2\tCUL4B\tNSD3\tSETD2\tPCGF6\tKANSL2\tHDAC1\tNR1H4\tPIH1D1\tREST\tWAC\tING3\tNTMT1\tKANSL3\tATRX\tUBE2N\tNIPBL\tOGT\tATXN7\tUIMC1\tWDR61\tPRDM12\tPRMT7\tKDM6B\tELP3\tSETD1A\tRBM14\tJAK2\tEHMT1\tSNW1\tMSL3\tBRCC3\tBRPF1\tHDAC6\tSUPT7L\tTET2\tNAA40\tSKR16C5\tKDM4B\tRYBP\tUSP51\tFOXP3\tHCFC1\tKAT2B\tING5\tKAT6B\tCDK1\tAUTS2\tSETD7\tKAT5\tZNF304\tDTX3L\tCHD5\tMIER1\tCHTOP\tHDAC2\tRNF2\tCREBBP\tKAT6A\tEZH2\tTAF1\tZNF451\tKDM1A\tFMR1\tJADE1\tKMT5A\tSUV39H2\tPRMT6\tDPY30\tDDB2\tEP400\tJADE2\tNSD1\tZNF335\tEHMT2\tDDB1\tTAF12\tPKN1\tUBE2A\tRPS6KA4\tARRB1\tHMGA2\tSUV39H1\tEPC1\tRCOR1\tDNMT3B\tASH2L\tRUVBL1\tTAF9\tLEF1\tPHC1\tKDM5D\tPAXIP1\tPER1\tCLOCK\tCOPRS\tSETD1B\tSMARCAD1\tKMT2B\tBRD7\tDMAP1\tRING1\tENY2\tRNF40\tMYSM1\tZNF274\tBRD8\tRPS6KA5\tBAZ1B\tEED\tTAF5L\tTADA3\tNACC2\tPHF8\tSMYD3\tMBIP\tKDM7A\tPOLE3\tPAF1\tCXXC1\tSIRT6\tHUWE1\tYEATS4\tJADE3\tPRMT2\tUSP16\tH2AFY\tPRKCA\tHDAC11\tPRKCB\tTET1\tNEK11\tKDM5B\tSIRT1\tMAP3K7\tMAPK3\tMUC1\tsaga_human\tCARM1\tMYB\tPHF1\tTET3\tKDM2A\tTRIP12\tCCNA2\tKMT5B\tKAT7\tKDM1B\tMT3\tPRDM5\tSNCA\tMCRS1\tTADA2A\tKDM2B\tRNF20\tAKAP8\tELP4\tBFD1\tKMT2C\tKDM4A\tPHF2\tUSP15\tTAF6L\tKDM3A\tTRRAP\tTADA1\tNOC2L\tOTUB1\tMORF4L1\tRUVBL2\tRAPGEF3\tTRIM16\tSPI1\tBCOR\tSETMAR\tPRMT1\tSUPT6H\tHDAC4\tCAMK1\tSUDS3\tPRKCD\tDCAF1\tFBL\tSUPT3H\tRNF168\tNAA50\tSUZ12\tKDM4D\tUSP22\tLIF\tSMARCB1\tHDAC5\tHDAC10\tATF2\tCDK9\tHLCS\tUBR5\tING4\tPRMT8\tPOLE4\tASH1L\n' +
  'Oxidative stress\tGO:0006979\tAPTX\tPTPRK\tPDGFRA\tSETX\tPNPT1\tLRRK2\tSOD2\tTP53\tECT2\tSELENOS\tPRKN\tSLC25A24\tMAPK7\tAQP1\tTPM1\tCHUK\tDHRS2\tPLA2R1\tRPS3\tNET1\tHDAC6\tETV5\tBRF2\tMMP9\tSESN2\tPLEKHA1\tAKT1\tMAPK1\tVKORC1L1\tALDH3B1\tRAD52\tPARK7\tMAP3K5\tG6PD\tAPOA4\tSTK25\tPYROXD1\tMGST1\tDAPK1\tMAPK9\tMAPK8\tPRDX3\tPRDX5\tVRK2\tPRKD1\tPDK2\tTRPM2\tGBA\tHIF1A\tPXN\tEGFR\tABL1\tHTRA2\tFXN\tNCF1\tPINK1\tPARP1\tERCC6L2\tATP13A2\tJUN\tARL6IP5\tPYCR1\tSOD1\tFABP1\tATF4\tGSKIP\tSTK24\tPRDX2\tNFE2L2\tAKR1C3\tSIRT1\tCRYGD\tMAPK3\tRHOB\tANKZF1\tCHD6\tRELA\tMT3\tIL6\tNOS3\tARNT\tZNF580\tWNT16\tURS0000324096_9606\tFOS\tPRKCD\tPYCR2\tTMEM161A\tANKRD2\tPDCD10\tZNF622\tROMO1\tRBM11\tPPIF\tPRR5L\n' +
  'Ras signaling\tGO:0007265\tMAPK1\tMAPK3\tAKT1\tAKT2\tAKT3\tALK\tARHGAP35\tARHGEF2\tCCND1\tCCND2\tCCND3\tCDK4\tCDK6\tCNKSR1\tCNKSR2\tCYTH2\tDUSP1\tDUSP2\tDUSP3\tDUSP4\tDUSP5\tDUSP6\tE2F1\tE2F2\tE2F3\tECT2\tEGFR\tEIF4EBP1\tEIF4EBP2\tEIF4EBP3\tERBB2\tETS1\tETS2\tEXOC1\tEXOC2\tEXOC3\tEXOC4\tEXOC5\tEXOC6\tEXOC7\tEXOC8\tFGFR1\tFGFR2\tFGFR3\tFGFR4\tFLT3\tFNTA\tFNTB\tFOS\tGFB2\tICMT\tINSR\tINSRR\tIRS1\tIRS2\tJUN\tKSR1\tKSR2\tMDM2\tMAP2K1\tMAP2K2\tMET\tMLST8\tMTOR\tNF1\tNFE2L2\tNFKB1\tPAK1\tPAK2\tPAK3\tPAK4\tPDGFRA\tPDGFRB\tPDPK1\tPEBP1\tPIK3CA\tPICI3CB\tPIK3CD\tPIK3CG\tPIK3R1\tPIK3R2\tPIK3R3\tPIK3R4\tPIC3R5\tPIK3R6\tPIN1\tPLXNB1\tPPP1CA\tPREX2\tPRKAA1\tPRKAA2\tPRKAB1\tPRKAB2\tPRKAG1\tPRKAG2\tPRKAG3\tPTEN\tRAC1\tRAC2\tRAC3\tAFAF\tBRAF\tRAF1\tRALA\tRALB\tRALBP1\tRALGDS\tRAPGEF1\tRAPGEF2\tKRAS\tMRAS\tNRAS\tRASA1\tRASA2\tRASA3\tRASAL1\tRASAL2\tRASAL3\tRASGRF1\tRASGRF2\tRASGRP1\tRASGRP2\tRASGRP3\tRASGRP4\tRASSF1\tRASSF2\tRASSF3\tRASSF4\tRASSF5\tRASSF6\tRASSF7\tRASSF8\tRASSF9\tRASSF10\tRB1\tRCE1\tRHEB\tRHOA\tRHOB\tRHOC\tROCK1\tROCK2\tROS1\tRPS6KA1\tRPS6KA2\tRPS6KA3\tRPS6KB1\tRPS6KB2\tRPTOR\tSAV1\tSCRIB\tSHC1\tSHC2\tSHC3\tSHC4\tSHOC2\tSOS1\tSOS2\tSPRED1\tSPRED2\tSPRED3\tSPRY1\tSPRY2\tSPRY3\tSPRY4\tSTK3\tSTK4\tSTK11\tTBK1\tTFDP1\tTFDP2\tTIAM1\tTIAM2\tTP53\tTSC1\tTSC2\tVAV1\tYAP1\n' +
  'TGF-B signaling\tGO:0007179\tWFIKKN2\tPTPRK\tCOL1A2\tCD109\tFSHB\tTGFBR3\tCAV1\tSMURF1\tSKI\tSKOR2\tWFIKKN1\tCOL3A1\tZNF703\tDAB2\tTHBS1\tADAMTSL2\tITGA3\tPEG10\tBAMBI\tLDLRAD4\tSRC\tSMAD7\tAPOA1\tIL17F\tSNW1\tBCL9L\tADAM17\tNKX2-1\tHSP90AB1\tSMURF2\tITGB5\tCDH5\tGCNT2\tZYX\tZNF451\tSDCBP\tBCL9\tCLDN5\tSTK11\tTGFBR1\tSMAD2\tCDKN1C\tCITED1\tASPN\tTGFB2\tMEN1\tHSPA1A\tSNX25\tZFYVE9\tTGFBR2\tSNX6\tSTUB1\tCDKN2B\tPXN\tNLK\tPIN1\tPDPK1\tADAM9\tJUN\tENG\tTRIM33\tSMAD4\tEID2\tARRB2\tACVR1\tVASN\tSIRT1\tPRDM16\tFLCN\tTWSG1\tPMEPA1\tACVRL1\tUSP9X\tPPM1A\tSOX11\tPBLD\tSTRAP\tLEMD3\tING2\tFERMT2\tHIPK2\tHPGD\tTGFB3\tSMAD6\tTGFB1I1\tUSP15\tSMAD3\tPTK2\tURS0000065D58_9606\tTGFB1\tFOS\n' +
  'TP53 signaling\tGO:0072331\tRPL26\tATM\tRRS1\tUBB\tNDRG1\tTP53\tRPS7\tSOX4\tMYBBP1A\tPRKN\tTP53BP2\tPAK1IP1\tNOP2\tMIF\tMDM4\tTFAP4\tTP73\tUSP28\tPLA2R1\tZNF385A\tATR\tSNW1\tRPL5\tPMAIP1\tCRADD\tSESN2\tHEXIM1\tPIDD1\tKAT5\tMAGEA2\tMSX1\tSTK11\tANKRD1\tPHLDA3\tRPS27L\tTWIST1\tSMYD2\tBOP1\tEP300\tCDKN1A\tPDK2\tMYO6\tIFI16\tKDM1A\tKMT5A\tPPP1R13B\tTRIAP1\tPAXIP1\tCDIP1\tCD74\tNOP53\tBCL3\tE2F7\tSNAI2\tRPL11\tCASP2\tBOK\tFHIT\tHINT1\tDDX5\tFOXM1\tSP100\tSNAI1\tRPL23\tPSMD10\tSIRT1\tMUC1\tZNF385B\tPTTG1IP\tMDM2\tCD44\tRNF34\tING4\tRPF2\tBAG6\tRRP8\tUSP10\tHIPK2\tCDK5RAP3\tPYCARD\tPYHIN1\tRPS6KA6\tAEN\tURS000039ED8D_9606\tRFFL\tDYRK2\n' +
  'cell cycle (Pancan Atlas)\t\tCDKN1A\tCDKN1B\tCDKN2A\tCDKN2B\tCDKN2C\tCCND1\tCCND2\tCCND3\tCCNE1\tCDK2\tCDK4\tCDK6\tRB1\tE2F1\tE2F3\n' +
  'HIPPO (Pancan Atlas)\t\tSTK4\tSTK3\tSAV1\tLATS1\tLATS2\tMOB1A\tMOB1B\tYAP1\tWWTR1\tTEAD1\tTEAD2\tTEAD3\tTEAD4\tPTPN14\tNF2\tWWC1\tTAOK1\tTAOK2\tTAOK3\tCRB1\tCRB2\tCRB3\tLLGL1\tLLGL2\tHMCN1\tSCRIB\tHIPK2\tFAT1\tFAT2\tFAT3\tFAT4\tDCHS1\tDCHS2\tCSNK1E\tCSNK1D\tAJUBA\tLIMD1\tWTIP\n' +
  'MYC (Pancan Atlas)\t\tMAX\tMGA\tMLX\tMLXIP\tMLXIPL\tMNT\tMXD1\tMXD3\tMXD4\tMXI1\tMYC\tMYCL\tMYCN\n' +
  'NOTCH (Pancan Atlas)\t\tARRDC1\tCNTN6\tCREBBP\tEP300\tHES1\tHES2\tHES3\tHES4\tHES5\tHEY1\tHEY2\tHEYL\tKAT2B\tKDM5A\tNOTCH1\tNOTCH2\tNOTCH3\tNOTCH4\tNOV\tNRARP\tPSEN2\tLFNG\tITCH\tNCSTN\tSPEN\tJAG1\tAPH1A\tFBXW7\tFHL1\tTHBS2\tHDAC2\tMFAP2\tCUL1\tRFNG\tNCOR1\tNCOR2\tMFAP5\tHDAC1\tNUMB\tJAG2\tMAML3\tMFNG\tCIR1\tCNTN1\tMAML1\tMAML2\tNUMBL\tPSEN1\tPSENEN\tRBPJ\tRBPJL\tRBX1\tSAP30\tSKP1\tSNW1\tCTBP1\tCTBP2\tADAM10\tAPH1B\tADAM17\tDLK1\tDLL1\tDLL3\tDLL4\tDNER\tDTX1\tDTX2\tDTX3\tDTX3L\tDTX4\tEGFL7\n' +
  'NRF2 (Pancan Atlas)\t\tNFE2L2\tKEAP1\tCUL3\n' +
  'PI3K (Pancan Atlas)\t\tEIF4EBP1\tAKT1\tAKT2\tAKT3\tAKT1S1\tDEPDC5\tDEPTOR\tINPP4B\tMAPKAP1\tMLST8\tMTOR\tNPRL2\tNPRL3\tPDK1\tPIK3CA\tPIK3CB\tPIK3R1\tPIK3R2\tPIK3R3\tPPP2R1A\tPTEN\tRHEB\tRICTOR\tRPTOR\tRPS6\tRPS6KB1\tSTK11\tTSC1\tTSC2\n' +
  'TGF-Beta (Pancan Atlas)\t\tTGFBR1\tTGFBR2\tACVR2A\tACVR1B\tSMAD2\tSMAD3\tSMAD4\n' +
  'RTK RAS (Pancan Atlas)\t\tABL1\tEGFR\tERBB2\tERBB3\tERBB4\tPDGFRA\tPDGFRB\tMET\tFGFR1\tFGFR2\tFGFR3\tFGFR4\tFLT3\tALK\tRET\tROS1\tKIT\tIGF1R\tNTRK1\tNTRK2\tNTRK3\tSOS1\tGRB2\tPTPN11\tKRAS\tHRAS\tNRAS\tRIT1\tARAF\tBRAF\tRAF1\tRAC1\tMAP2K1\tMAP2K2\tMAPK1\tNF1\tRASA1\tCBL\tERRFI1\tCBLB\tCBLC\tINSR\tINSRR\tIRS1\tSOS2\tSHC1\tSHC2\tSHC3\tSHC4\tRASGRP1\tRASGRP2\tRASGRP3\tRASGRP4\tRAPGEF1\tRAPGEF2\tRASGRF1\tRASGRF2\tFNTA\tFNTB\tRCE1\tICMT\tMRAS\tPLXNB1\tMAPK3\tARHGAP35\tRASA2\tRASA3\tRASAL1\tRASAL2\tRASAL3\tSPRED1\tSPRED2\tSPRED3\tDAB2IP\tSHOC2\tPPP1CA\tSCRIB\tPIN1\tKSR1\tKSR2\tPEBP1\tERF\tPEA15\tJAK2\tIRS2\n' +
  'TP53 (Pancan Atlas)\t\tTP53\tMDM2\tMDM4\tATM\tCHEK2\tRPS6KA3\n' +
  'WNT (Pancan Atlas)\t\tCHD8\tLEF1\tLGR4\tLGR5\tLRP5\tLRP6\tLZTR1\tNDP\tPORCN\tRSPO1\tSFRP1\tSFRP2\tSFRP4\tSFRP5\tSOST\tTCF7L1\tTLE1\tTLE2\tTLE3\tTLE4\tWIF1\tZNRF3\tCTNNB1\tDVL1\tDVL2\tDVL3\tFRAT1\tFRAT2\tFZD1\tFZD10\tFZD2\tFZD3\tFZD4\tFZD5\tFZD6\tFZD7\tFZD8\tFZD9\tWNT1\tWNT10A\tWNT10B\tWNT11\tWNT16\tWNT2\tWNT3A\tWNT4\tWNT5A\tWNT5B\tWNT6\tWNT7A\tWNT7B\tWNT8A\tWNT8B\tWNT9A\tWNT9B\tAMER1\tAPC\tAXIN1\tAXIN2\tDKK1\tDKK2\tDKK3\tDKK4\tGSK3B\tRNF43\tTCF7\tTCF7L2\tCHD4\n'

