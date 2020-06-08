import Button, { BtnSizes, BtnTypes } from '@celo/react-components/components/Button.v2'
import KeyboardAwareScrollView from '@celo/react-components/components/KeyboardAwareScrollView'
import KeyboardSpacer from '@celo/react-components/components/KeyboardSpacer'
import colors from '@celo/react-components/styles/colors.v2'
import fontStyles from '@celo/react-components/styles/fonts.v2'
import variables from '@celo/react-components/styles/variables'
import { parseInputAmount } from '@celo/utils/src/parsing'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { Trans, useTranslation, WithTranslation } from 'react-i18next'
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { getNumberFormatSettings } from 'react-native-localize'
import SafeAreaView from 'react-native-safe-area-view'
import { connect, useDispatch, useSelector } from 'react-redux'
import { hideAlert, showError } from 'src/alert/actions'
import { errorSelector } from 'src/alert/reducer'
import CeloAnalytics from 'src/analytics/CeloAnalytics'
import { CustomEventNames } from 'src/analytics/constants'
import { MoneyAmount } from 'src/apollo/types'
import { ErrorMessages } from 'src/app/ErrorMessages'
import CurrencyDisplay from 'src/components/CurrencyDisplay'
import LineItemRow from 'src/components/LineItemRow'
import { DOLLAR_TRANSACTION_MIN_AMOUNT } from 'src/config'
import { fetchExchangeRate } from 'src/exchange/actions'
import { ExchangeRatePair } from 'src/exchange/reducer'
import { CURRENCIES, CURRENCY_ENUM } from 'src/geth/consts'
import { Namespaces, withTranslation } from 'src/i18n'
import { LocalCurrencyCode } from 'src/localCurrency/consts'
import {
  convertDollarsToLocalAmount,
  convertDollarsToMaxSupportedPrecision,
  convertLocalAmountToDollars,
} from 'src/localCurrency/convert'
import { useLocalCurrencyCode } from 'src/localCurrency/hooks'
import { getLocalCurrencyCode, getLocalCurrencyExchangeRate } from 'src/localCurrency/selectors'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'
import { RootState } from 'src/redux/reducers'
import DisconnectBanner from 'src/shared/DisconnectBanner'
import { dollarBalanceSelector } from 'src/stableToken/selectors'

const { decimalSeparator } = getNumberFormatSettings()

// interface State {
// inputToken: CURRENCY_ENUM
// makerToken: CURRENCY_ENUM
// makerTokenAvailableBalance: string
// inputAmount: string
// }

// interface StateProps {
// exchangeRatePair: ExchangeRatePair | null
// error: ErrorMessages | null
// localCurrencyCode: LocalCurrencyCode
// localCurrencyExchangeRate: string | null | undefined
// }

// interface DispatchProps {
// fetchExchangeRate: typeof fetchExchangeRate
// showError: typeof showError
// hideAlert: typeof hideAlert
// }

type RouteProps = StackScreenProps<StackParamList, Screens.FiatExchangeAmount>

type Props = RouteProps

// const mapStateToProps = (state: RootState): StateProps => ({
// exchangeRatePair: state.exchange.exchangeRatePair,
// error: errorSelector(state),
// localCurrencyCode: getLocalCurrencyCode(state),
// localCurrencyExchangeRate: getLocalCurrencyExchangeRate(state),
// })

export function ExchangeTradeScreen({ route }: Props) {
  const isAddFunds = route.params?.isAddFunds ?? false
  const { t } = useTranslation()

  const [inputAmount, setInputAmount] = React.useState('')
  const dollarBalance = useSelector(dollarBalanceSelector)

  const localExchangeRate = useSelector(getLocalCurrencyExchangeRate)
  const localCurrencyCode = useLocalCurrencyCode()
  const dollarsToLocal = (amount: BigNumber.Value) =>
    convertDollarsToLocalAmount(amount, localCurrencyCode ? localExchangeRate : 1)

  const parsedInputAmount = parseInputAmount(inputAmount, decimalSeparator)
  const dollarAmount = convertDollarsToMaxSupportedPrecision(
    dollarsToLocal(parsedInputAmount) ?? new BigNumber('0')
  )

  const inputAmountIsValid = () => {
    if (isAddFunds) {
      return dollarBalance && dollarAmount.isLessThanOrEqualTo(dollarBalance)
    } else {
      // TBA
      return false
    }
  }

  const isNextInvalid = () => {
    const amountIsInvalid =
      // TODO: change  this
      !inputAmountIsValid() || dollarAmount.isLessThan(DOLLAR_TRANSACTION_MIN_AMOUNT)

    return amountIsInvalid
  }

  const dispatch = useDispatch()

  const updateError = () => {
    if (inputAmountIsValid()) {
      // TODO: change this
      dispatch(showError(ErrorMessages.NSF_DOLLARS))
    } else {
      dispatch(hideAlert())
    }
  }

  const onChangeExchangeAmount = (amount: string) => {
    setInputAmount(amount)
    updateError()
  }

  const goNext = () => {
    // TODO: Add logic here
  }

  return (
    <SafeAreaView
      // Force inset as this screen uses auto focus and KeyboardSpacer padding is initially
      // incorrect because of that
      forceInset={{ top: 'never', bottom: 'always' }}
      style={styles.container}
    >
      <DisconnectBanner />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.amountInputContainer}>
          <View>
            <Text style={styles.exchangeBodyText}>{t('global:next')}</Text>
          </View>
          <TextInput
            autoFocus={true}
            keyboardType={'decimal-pad'}
            onChangeText={onChangeExchangeAmount}
            value={inputAmount}
            placeholderTextColor={'#BDBDBD'}
            placeholder={'0'}
            style={styles.currencyInput}
            testID="ExchangeInput"
          />
        </View>
        <LineItemRow
          textStyle={styles.subtotalBodyText}
          title={
            <Trans i18nKey="celoDollarsAt" ns={Namespaces.fiatExchangeFlow}>
              Celo Dollars @{' '}
              <CurrencyDisplay
                amount={{
                  value: localExchangeRate ?? new BigNumber('0'),
                  currencyCode: CURRENCIES[CURRENCY_ENUM.DOLLAR].code,
                }}
              />
            </Trans>
          }
          amount={
            <CurrencyDisplay amount={{ value: dollarAmount, currencyCode: CURRENCY_ENUM.DOLLAR }} />
          }
        />
      </KeyboardAwareScrollView>
      <Button
        onPress={goNext}
        text={t(`global:next`)}
        accessibilityLabel={t('continue')}
        disabled={isNextInvalid()}
        size={BtnSizes.FULL}
        style={styles.reviewBtn}
        testID="FiatExchangeNextButton"
      />
      <KeyboardSpacer />
    </SafeAreaView>
  )
}

export default ExchangeTradeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  exchangeBodyText: {
    ...fontStyles.regular500,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  subtotalBodyText: {
    ...fontStyles.small,
  },
  currencyInput: {
    ...fontStyles.regular,
    marginLeft: 10,
    flex: 1,
    textAlign: 'right',
    fontSize: 19,
    lineHeight: Platform.select({ android: 27, ios: 23 }), // vertical align = center
    height: 48, // setting height manually b.c. of bug causing text to jump on Android
    color: colors.goldDark,
  },
  reviewBtn: {
    padding: variables.contentPadding,
  },
})
