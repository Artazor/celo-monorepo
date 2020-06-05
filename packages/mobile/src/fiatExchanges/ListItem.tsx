import colors from '@celo/react-components/styles/colors.v2'
import variables from '@celo/react-components/styles/variables'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'

interface Props {
  children: React.ReactNode
}

export function ListItem({ children }: Props) {
  return <View style={styles.container}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: variables.contentPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
})
