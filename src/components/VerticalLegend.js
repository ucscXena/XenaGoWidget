import PureComponent from './PureComponent';
import React from 'react';
import BaseStyle from "../css/base.css";

export default class VerticalLegend extends PureComponent {

  render() {
    return (
      <div>
      <table className={BaseStyle.verticalLegendBox}>
          <tbody>
          <tr><td className={BaseStyle.overRepresentedColor}>
            <strong>Over Represented</strong>
          </td></tr>
            <tr>
              <td className={BaseStyle.neutralColor}><strong>Occurs as Expected</strong>
            </td></tr>
            <tr><td className={BaseStyle.underRepresentedColor}><strong>Under Represented</strong>
            </td></tr>
          </tbody>
        </table>
      </div>
    )
  }
}
