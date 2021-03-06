import PhoneAndUsers from '@celo/react-components/icons/PhoneAndUsers'
import SearchUser from '@celo/react-components/icons/SearchUser'
import VerificationTexts from '@celo/react-components/icons/VerificationTexts'
import colors from '@celo/react-components/styles/colors'
import { fontStyles } from '@celo/react-components/styles/fonts'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { WithTranslation } from 'react-i18next'
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { connect } from 'react-redux'
import { setRetryVerificationWithForno } from 'src/account/actions'
import CancelButton from 'src/components/CancelButton'
import Carousel, { CarouselItem } from 'src/components/Carousel'
import DevSkipButton from 'src/components/DevSkipButton'
import { Namespaces, withTranslation } from 'src/i18n'
import LoadingSpinner from 'src/icons/LoadingSpinner'
import { cancelVerification, startVerification } from 'src/identity/actions'
import { VerificationStatus } from 'src/identity/types'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'
import { RootState } from 'src/redux/reducers'
import Logger from 'src/utils/Logger'
import { VerificationFailedModal } from 'src/verify/VerificationFailedModal'
import { toggleFornoMode } from 'src/web3/actions'

const TAG = 'VerificationLoadingScreen'

interface StateProps {
  e164Number: string
  verificationStatus: VerificationStatus
  retryWithForno: boolean
  fornoMode: boolean
}

interface DispatchProps {
  startVerification: typeof startVerification
  cancelVerification: typeof cancelVerification
  setRetryVerificationWithForno: typeof setRetryVerificationWithForno
  toggleFornoMode: typeof toggleFornoMode
}

type Props = StateProps &
  DispatchProps &
  WithTranslation &
  StackScreenProps<StackParamList, Screens.VerificationLoadingScreen>

const mapDispatchToProps = {
  startVerification,
  cancelVerification,
  setRetryVerificationWithForno,
  toggleFornoMode,
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    e164Number: state.account.e164PhoneNumber,
    verificationStatus: state.identity.verificationStatus,
    retryWithForno: state.account.retryVerificationWithForno,
    fornoMode: state.web3.fornoMode,
  }
}

class VerificationLoadingScreen extends React.Component<Props> {
  static navigationOptions = { gestureEnabled: false, header: null }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton)
    this.props.startVerification()
  }

  componentDidUpdate(prevProps: Props) {
    if (this.didVerificationStatusChange(prevProps, VerificationStatus.RevealingNumber)) {
      navigate(Screens.VerificationInterstitialScreen)
    } else if (this.didVerificationStatusChange(prevProps, VerificationStatus.Done)) {
      navigate(Screens.ImportContacts)
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton)
  }

  handleBackButton = () => {
    // Cancel verification when user presses back button on this screen
    this.onCancel()
    return true
  }

  onCancel = () => {
    Logger.debug(TAG + '@onCancel', 'Cancelled, going back to education screen')
    this.props.cancelVerification()
    navigate(Screens.VerificationEducationScreen)
  }

  didVerificationStatusChange = (prevProps: Props, status: VerificationStatus) => {
    return (
      prevProps.verificationStatus !== status &&
      this.props.verificationStatus === status &&
      this.props.navigation.isFocused
    )
  }

  render() {
    const { e164Number, t, fornoMode, retryWithForno, verificationStatus } = this.props

    const items: CarouselItem[] = [
      {
        icon: <SearchUser />,
        text: t('loading.card1'),
      },
      {
        icon: <PhoneAndUsers />,
        text: t('loading.card2'),
      },
      {
        icon: <VerificationTexts />,
        text: t('loading.card3'),
      },
    ]
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.buttonCancelContainer}>
            <CancelButton onCancel={this.onCancel} />
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <DevSkipButton nextScreen={Screens.VerificationInterstitialScreen} />
            <View style={styles.statusContainer}>
              <LoadingSpinner />
              <Text style={styles.textPhoneNumber}>
                {t('loading.verifyingNumber', { number: e164Number })}
              </Text>
              <Text style={styles.textOpenTip}>{t('loading.keepOpen')}</Text>
            </View>
            <Carousel containerStyle={styles.carouselContainer} items={items} />
          </ScrollView>
        </View>
        <VerificationFailedModal
          verificationStatus={verificationStatus}
          retryWithForno={retryWithForno}
          fornoMode={fornoMode}
          setRetryVerificationWithForno={this.props.setRetryVerificationWithForno}
          toggleFornoMode={this.props.toggleFornoMode}
          cancelVerification={this.props.cancelVerification}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDarker,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancelContainer: {
    position: 'absolute',
    left: 5,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 46,
  },
  textPhoneNumber: {
    ...fontStyles.body,
    ...fontStyles.semiBold,
    marginTop: 20,
  },
  textOpenTip: {
    ...fontStyles.body,
    marginTop: 5,
  },
  carouselContainer: {
    paddingVertical: 20,
  },
})

export default connect<StateProps, DispatchProps, {}, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation(Namespaces.nuxVerification2)(VerificationLoadingScreen))
