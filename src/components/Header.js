import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'

import GoogleLogin, {GoogleLogout} from 'react-google-login'
import FaGithub from 'react-icons/lib/fa/github'


export default class Header extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      geneNameSearch: '',
      profile:undefined,
    }
  }
    refreshTokenSetup = (res) => {
      let refreshTiming = (res.tokenId.expires_in || 3600 - 5 * 60) * 1000

      const refreshToken = async () => {
        const newAuthRes = await res.reloadAuthResponse()
        refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000
        setTimeout(refreshToken, refreshTiming)
      }
      setTimeout(refreshToken, refreshTiming)
    }

    showHelp = () => {
      window.open('https://ucsc-xena.gitbook.io/project/overview-of-features/gene-sets-about')
    }

    setUser(profile) {
      this.props.setUser(profile)
      this.setState({
        profile:profile
      })
    }

    render(){
      // eslint-disable-next-line no-undef
      const GOOGLE_APP_ID = `${__GOOGLE_APP_ID__}`
      return (
        <div style={{
          width:'100%'
          ,borderBottom:'solid'
          ,borderWidth: 2
          ,marginBottom: 4
          ,paddingBottom: 2
          ,borderColor: 'darkgreen'
        }}>
          <div style={{display:'inline'}}>
            <img
              alt={'Xena'} src="https://raw.githubusercontent.com/ucscXena/XenaGoWidget/develop/src/images/xenalogo_deW_icon.ico"
              style={{verticalAlign:'middle',height: 30,marginBottom:4,padding: 5,marginRight: 10,backgroundColor:'#1a535c'}}/>
          </div>
          <div
            style={{
              // color: 'mediumaquamarine',
              color: '#1a535c',
              display: 'inline',
              fontSize: 18,
              fontFamily: 'sans-serif',
              fontWeight: 'bolder',
              borderBottom: 'solid',
              borderWidth: '2px'
            }}

          >
            <div style={{paddingBottom: 20,display:'inline'}}>
                  Xena Gene Set Viewer
            </div>
            <a href='https://github.com/ucscXena/XenaGoWidget' rel="noreferrer noopener" style={{marginLeft: 20}} target='_blank'>
              <FaGithub style={{fontSize:'xx-large',color:'black',paddingBottom:5}}/>
            </a>
          </div>
          <div style={{display:'inline',right: 10,position: 'absolute'}}>
            {this.state.profile===undefined&&
              <GoogleLogin
                buttonText="Login"
                className={'pull-right'}
                clientId={GOOGLE_APP_ID}
                cookiePolicy={'single_host_origin'}
                isSignedIn
                onFailure={
                  // eslint-disable-next-line no-console
                  (err) => console.error('error', err)
                }
                onSuccess={(response) => {
                  this.refreshTokenSetup(response)
                  this.setUser(response)
                }}
              />
            }
            {this.state.profile &&
              <div
                style={{display:'inline',fontFamily:'sans-serif',marginRight:10}}>
                {this.state.profile.profileObj.name} ({this.state.profile.profileObj.email})
              </div>
            }
            {this.state.profile!==undefined &&
              <GoogleLogout
                buttonText="Logout"
                clientId={GOOGLE_APP_ID}
                onFailure={
                  // eslint-disable-next-line no-console
                  (err) => console.error('error', err)
                }
                onLogoutSuccess={() => {
                  this.setUser()
                }}
              />
            }
          </div>
        </div>
      )
    }

}

Header.propTypes = {
  setUser: PropTypes.any,
}
