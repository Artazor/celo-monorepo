import TextButton from '@celo/react-components/components/TextButton'
import fontStyles from '@celo/react-components/styles/fonts.v2'
import variables from '@celo/react-components/styles/variables'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ListItem } from 'src/fiatExchanges/ListItem'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'

type RouteProps = StackScreenProps<StackParamList, Screens.FiatExchangeAmount>
type Props = RouteProps

const providers = {
  cashOut: [{ image: '<Image of Moonpay>' }, { image: '<Image of Carbon>' }],
  addFunds: [{ image: '<Image of Moonpay>' }, { image: '<Image of Carbon>' }],
}

function FiatExchangeOptions({ route }: Props) {
  function goToProvider() {
    // TODO: implement this
  }
  const { isAddFunds } = route.params
  const { t } = useTranslation('fiatExchangeFlow')
  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.pleaseSelectProvider}>{t('pleaseSelectProvider')}</Text>
        <View>
          {providers[isAddFunds ? 'addFunds' : 'cashOut'].map((value, idx) => {
            return (
              <ListItem key={idx}>
                <TextButton style={styles.optionTitle} onPress={goToProvider}>
                  {value.image}
                </TextButton>
              </ListItem>
            )
          })}
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}

export default FiatExchangeOptions

const styles = StyleSheet.create({
  container: {
    paddingVertical: variables.contentPadding,
    // flex: 1,
  },
  optionTitle: {
    ...fontStyles.regular,
    paddingLeft: variables.contentPadding,
  },
  pleaseSelectProvider: {
    ...fontStyles.regular,
    paddingHorizontal: variables.contentPadding,
  },
})
