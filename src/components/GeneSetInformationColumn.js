import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import {GeneSetSubCohortBox} from './GeneSetSubCohortBox'
import BaseStyle from '../css/base.css'
import HoverGeneView from './hover/HoverGeneView'
import SelectGeneView from './hover/SelectGeneView'
import {getHostData} from '../functions/FetchFunctions'

const XENA_SS_LINK = 'https://xenabrowser.net/heatmap/'

export class GeneSetInformationColumn extends PureComponent {

  constructor(props) {
    super(props)
  }


  canShowHover() {
    const {geneHoverData,cohortIndex} = this.props
    if(!geneHoverData || geneHoverData.length !== 2) return false
    // if they both are tissue 'Header' then show
    if(geneHoverData[0].tissue === geneHoverData[1].tissue && geneHoverData[1].tissue === 'Header') {
      return true
    }
    // or if the selected cohort is NOT
    return geneHoverData[cohortIndex].tissue !== 'Header'
  }

  // ?columns=%5B%7B%22name%22%3A%22tcga_Kallisto_tpm%22%2C%22host%22%3A%22https%3A%2F%2Ftoil.xenahubs.net%22%2C%22fields%22%3A%22TP53%20FOXM1%22%7D%5D\">Example 1</a>"

  generateLink(){
    const hostData = getHostData(this.props.cohort[this.props.cohortIndex], this.props.view)
    console.log('host data',hostData)
    console.log('props',this.props)

    let linkString = ''

    // add gene link
    // let geneSetName = 'tcga_Kallisto_tpm'
    // let geneSetHost = 'https://toil.xenahubs.net'
    let geneSetName = hostData.dataset
    // let geneSetHost = 'https://toil.xenahubs.net'
    let geneSetHost = hostData.host
    // let genes = 'TP53 FOXM1'
    let genes = this.props.geneDataStats[this.props.cohortIndex].pathways.map( p => p.gene[0]).join(' ')
    console.log('genes',genes)
    linkString += `?columns=[{"name":"${geneSetName}","host":"${geneSetHost}","fields":"${genes}"}]`

    // add gene link

    // <a id="link1" href="https://xenabrowser.net/heatmap/?columns=%5B%7B%22name%22%3A%22tcga_Kallisto_tpm%22%2C%22host%22%3A%22https%3A%2F%2Ftoil.xenahubs.net%22%2C%22fields%22%3A%22TP53%20FOXM1%22%7D%5D">Example 1</a>
    // https://xenabrowser.net/heatmap/?columns=%5B%7B%22name%22:%22Gene%20Details%22,%22host%22:%22https://toil.xenahubs.net%22,%22fields%22:%22TP53%20FOXM1%22%7D%5D
    // https://xenabrowser.net/heatmap/?columns=%5B%7B%22name%22%3A%22tcga_Kallisto_tpm%22%2C%22host%22%3A%22https%3A%2F%2Ftoil.xenahubs.net%22%2C%22fields%22%3A%22TP53%20FOXM1%22%7D%5D

    let encodedUri = encodeURI(linkString)
    return XENA_SS_LINK + encodedUri.replace(/:/g,'%3A').replace(/\//g,'%2F').replace(/,/g,'%2C')
  }

  render() {

    const cohortColor = this.props.cohortColor[this.props.cohortIndex]

    if (this.props.geneDataStats && this.props.geneDataStats[this.props.cohortIndex].samples) {
      const externalLink = this.generateLink()
      return (
        <div
          className={BaseStyle.geneSetDetailBox}
          style={{backgroundColor: cohortColor}}
        >
          <div className={BaseStyle.ssInfoBox}>
            <a
              href={externalLink}
              rel="noopener noreferrer"
              target='_blank'>Link to SS</a>
          </div>
          <GeneSetSubCohortBox
            cohortIndex={this.props.cohortIndex}
            geneDataStats={this.props.geneDataStats}
            onEditCohorts={this.props.onEditCohorts}
            subCohortCounts={this.props.subCohortCounts}
          />
          {this.props.open &&
          <SelectGeneView
            data={this.props.geneDataStats[this.props.cohortIndex]}
          />
          }
          {
            this.canShowHover() &&
            <HoverGeneView
              cohortIndex={this.props.cohortIndex}
              data={this.props.geneHoverData ? this.props.geneHoverData[this.props.cohortIndex] : null}
              view={this.props.view}
            />
          }
        </div>
      )
    }
    return <div/>
  }

}

GeneSetInformationColumn.propTypes = {
  cohort: PropTypes.any.isRequired,
  cohortColor: PropTypes.any.isRequired,
  cohortIndex: PropTypes.any.isRequired,
  geneDataStats: PropTypes.any,
  geneHoverData: PropTypes.any,
  onEditCohorts: PropTypes.any.isRequired,
  open: PropTypes.any.isRequired,
  subCohortCounts: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,

}
