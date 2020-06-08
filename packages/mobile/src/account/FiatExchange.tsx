import TextButton from '@celo/react-components/components/TextButton.v2'
import colors from '@celo/react-components/styles/colors.v2'
import fontStyles from '@celo/react-components/styles/fonts.v2'
import variables from '@celo/react-components/styles/variables'
import { CURRENCIES, CURRENCY_ENUM } from '@celo/utils/src'
import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { Trans, useTranslation, WithTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { WebView } from 'react-native-webview'
import { connect, useSelector } from 'react-redux'
import { showError } from 'src/alert/actions'
import { ErrorMessages } from 'src/app/ErrorMessages'
import CurrencyDisplay from 'src/components/CurrencyDisplay'
import { ListItem } from 'src/fiatExchanges/ListItem'
import { Namespaces, withTranslation } from 'src/i18n'
import { LocalCurrencyCode } from 'src/localCurrency/consts'
import { useDollarsToLocalAmount, useLocalCurrencyCode } from 'src/localCurrency/hooks'
import { getLocalCurrencyCode } from 'src/localCurrency/selectors'
import DrawerTopBar from 'src/navigator/DrawerTopBar'
import { Screens } from 'src/navigator/Screens'
import { RootState } from 'src/redux/reducers'
import { stableTokenBalanceSelector } from 'src/stableToken/reducer'

interface OwnProps {}
type Props = OwnProps

function FiatExchange(props: Props) {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const goToAddFunds = React.useCallback(() => {
    navigation.navigate(Screens.FiatExchangeAmount)
  }, [])
  const localCurrencyCode = useLocalCurrencyCode()
  const isUsdLocalCurrency = localCurrencyCode === LocalCurrencyCode.USD
  const dollarBalance = useSelector(stableTokenBalanceSelector)
  const dollarAmount = {
    value: dollarBalance ?? '0',
    currencyCode: CURRENCIES[CURRENCY_ENUM.DOLLAR].code,
  }

  return (
    <SafeAreaView style={styles.container}>
      <DrawerTopBar />
      <View style={styles.image} />
      <View style={styles.balanceSheet}>
        <Text style={styles.currentBalance}>{t('global:currentBalance')}</Text>
        <CurrencyDisplay
          style={styles.localBalance}
          amount={dollarAmount}
          showLocalAmount={!isUsdLocalCurrency}
        />
        {!isUsdLocalCurrency && (
          <Text style={styles.dollarBalance}>
            <Trans i18nKey="dollarBalance" ns={Namespaces.walletFlow5}>
              <CurrencyDisplay showLocalAmount={false} hideSymbol={true} amount={dollarAmount} />{' '}
              Celo Dollars
            </Trans>
          </Text>
        )}
      </View>
      <View style={styles.options}>
        <ListItem>
          <TextButton style={styles.optionTitle} onPress={goToAddFunds}>
            {t('fiatExchangeFlow:add_funds')}
          </TextButton>
        </ListItem>
        <ListItem>
          <Text style={styles.optionTitleComingSoon}>{t('fiatExchangeFlow:cash_out')}</Text>
        </ListItem>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  image: { height: 200 },
  balanceSheet: {
    padding: variables.contentPadding,
    height: 112,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  currentBalance: {
    ...fontStyles.h2,
    marginBottom: 4,
  },
  localBalance: {
    ...fontStyles.large,
    marginBottom: 2,
  },
  dollarBalance: {
    ...fontStyles.small,
    color: colors.gray4,
  },
  options: {
    borderTopWidth: 1,
    borderTopColor: colors.gray2,
  },
  optionTitle: {
    ...fontStyles.regular,
    paddingLeft: variables.contentPadding,
  },
  optionTitleComingSoon: {
    ...fontStyles.regular,
    color: colors.gray3,
    paddingLeft: variables.contentPadding,
  },
})

export default FiatExchange
