import PropTypes from 'prop-types';
import React from 'react';
import { omit, isEqual } from 'underscore';
import PureComponent from './PureComponent';
import { HeaderLabel } from './HeaderLabel';
import { DiffLabel } from './DiffLabel';
import {GENE_LABEL_HEIGHT, GENE_LEGEND_HEIGHT} from './PathwayScoresView';
import BaseStyle from '../css/base.css';

const CHI_SQUARE_MAX = 100.0;
const OMIT_ARRAY = ['hoveredPathway','data' ];

export default class LabelSet extends PureComponent {

  shouldComponentUpdate(nextProps) {
    return !isEqual(omit(nextProps, OMIT_ARRAY), omit(this.props, OMIT_ARRAY));
  }

  render() {
    const {
      pathways,
      layout,
      filter,
      highlightedGene,
      labelHeight,
      height,
      cohortIndex,
      colorSettings,
      numSamples,
    } = this.props;
    if (pathways.length === layout.length) {
      const possibleHeight = height - GENE_LABEL_HEIGHT + GENE_LEGEND_HEIGHT;
      const offset = cohortIndex === 0 ? height - GENE_LABEL_HEIGHT : 0;

      return layout.map((el, i) => {
        const d = pathways[i];
        const geneLength = d.gene.length;
        const labelKey = d.gene[0];
        const highlighted = highlightedGene === labelKey;
        const diffHeight = (Math.abs(d.diffScore) < CHI_SQUARE_MAX ? Math.abs(d.diffScore) / CHI_SQUARE_MAX : 1) * possibleHeight;
        const labelOffset = cohortIndex === 0 ? possibleHeight : labelHeight;
        const actualOffset = (cohortIndex === 1 ? labelOffset+30 : possibleHeight - diffHeight)+25;
        return (
          <div className={cohortIndex === 0 ? BaseStyle.labelDefaultTop : BaseStyle.labelDefaultBottom} key={`${labelKey}-${cohortIndex}-outer`}>
            { ((cohortIndex === 0 && d.diffScore > 0) || cohortIndex === 1 && d.diffScore < 0)
                        && (
                          <DiffLabel
                            cohortIndex={cohortIndex}
                            colorSettings={colorSettings}
                            geneLength={geneLength}
                            item={d}
                            key={`${labelKey}-${cohortIndex}diff`}
                            labelHeight={diffHeight}
                            labelOffset={actualOffset-45}
                            labelString={labelKey}
                            left={el.start}
                            numSamples={numSamples}
                            width={el.size}
                          />
                        )}
            { cohortIndex === 0
                        && (
                          <div style={{
                            position: 'absolute',
                            height,
                            top: 14,
                            left: el.start,
                            width: el.size,
                            opacity: 0.1,
                            zIndex: -20000,
                          }}
                          />
                        )}
            { cohortIndex === 1
                        && (
                          <div style={{
                            position: 'absolute',
                            height,
                            top: 25,
                            left: el.start,
                            width: el.size,
                            opacity: 0.1,
                            zIndex: -20000,
                          }}
                          />
                        )}
            <HeaderLabel
              colorSettings={colorSettings}
              filter={filter}
              geneLength={geneLength}
              highlighted={highlighted}
              item={d}
              key={`${labelKey}-${cohortIndex}`}
              labelHeight={labelHeight}
              labelOffset={offset+11}
              labelString={labelKey}
              left={el.start}
              numSamples={numSamples}
              width={el.size}
            />
          </div>
        );
      });
    }
    return <div />;
  }
}
LabelSet.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  colorSettings: PropTypes.any.isRequired,
  filter: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired,
  highlightedGene: PropTypes.any,
  labelHeight: PropTypes.any.isRequired,
  layout: PropTypes.any.isRequired,
  numSamples: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,
};
