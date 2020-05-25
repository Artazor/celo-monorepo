import { getBuildArtifacts } from '@openzeppelin/upgrades'

/* HACK! truffle test was unable to compile this test (TypeScript would end up
 * claiming that it couldn't find the name `assert`) without the following 5
 * lines.
 */
import { MigrationsContract } from 'types'
// @ts-ignore
const Migrations: MigrationsContract = artifacts.require('Migrations')

import { reportLayoutIncompatibilities } from '@celo/protocol/lib/layout'

/* We store artifacts for the various test cases in ./test/resources/layout
 * For each test case, there should be a build_<test case name> directory with
 * truffle-compile output, and contracts_<test case name> directory with the
 * corresponding contracts.
 *
 * The base for most of these tests is in contracts_original
 */
const getTestArtifacts = (caseName: string) => {
  return getBuildArtifacts(`./test/resources/layout/build_${caseName}`)
}

const testCases = {
  original: getTestArtifacts('original'),
  inserted_constant: getTestArtifacts('inserted_constant'),
  appended: getTestArtifacts('appended'),
  inserted: getTestArtifacts('inserted'),
  appended_in_parent: getTestArtifacts('appended_in_parent'),
  removed: getTestArtifacts('removed'),
  removed_from_struct: getTestArtifacts('removed_from_struct'),
  removed_from_parent: getTestArtifacts('removed_from_parent'),
  inserted_in_struct: getTestArtifacts('inserted_in_struct'),
  inserted_in_library_struct: getTestArtifacts('inserted_in_library_struct'),
  removed_from_library_struct: getTestArtifacts('removed_from_library_struct'),
}

const assertCompatible = (report) => {
  assert.isTrue(report.every((contractReport) => contractReport.compatible))
}

const assertNotCompatible = (report) => {
  assert.isFalse(report.every((contractReport) => contractReport.compatible))
}

const selectReportFor = (report, contractName) => {
  return report.find((contractReport) => contractReport.contract === contractName)
}

/* Checks that expected errors were reported for a contract.
 * @param report The list of CompatibilityInfo's to check.
 * @param contractName The name of the contract to check.
 * @param expectedMatches The regular expressions that each successive error for
 * `contractName` should match.
 */
const assertContractErrorsMatch = (report, contractName, expectedMatches) => {
  const contractReport = selectReportFor(report, contractName)
  assert.equal(contractReport.errors.length, 1)

  contractReport.errors.forEach((error, i) => {
    assert.match(error, expectedMatches[i])
  })
}

describe('#reportLayoutIncompatibilities()', () => {
  describe('when the contracts are the same', () => {
    it('reports no incompatibilities', () => {
      const report = reportLayoutIncompatibilities(testCases.original, testCases.original)
      assertCompatible(report)
    })
  })

  describe('when a constant is inserted in a contract', () => {
    it('reports no incompatibilities', () => {
      const report = reportLayoutIncompatibilities(testCases.original, testCases.inserted_constant)
      assertCompatible(report)
    })
  })

  describe('when a variable is appended in a contract', () => {
    it('reports no incompatibilities', () => {
      const report = reportLayoutIncompatibilities(testCases.original, testCases.appended)
      assertCompatible(report)
    })
  })

  describe('when a variable is inserted in a contract', () => {
    it('reports an inserted variable', () => {
      const report = reportLayoutIncompatibilities(testCases.original, testCases.inserted)
      assertNotCompatible(report)
      assertContractErrorsMatch(report, 'TestContract', [/inserted/])
    })
  })

  describe('when a variable is appended in a parent contract', () => {
    it('reports an inserted variable', () => {
      const report = reportLayoutIncompatibilities(testCases.original, testCases.appended_in_parent)
      assertNotCompatible(report)
      assertContractErrorsMatch(report, 'TestContract', [/inserted/])
    })
  })

  describe('when a variable is removed in a contract', () => {
    it('reports a removed variable', () => {
      const report = reportLayoutIncompatibilities(testCases.original, testCases.removed)
      assertNotCompatible(report)
      assertContractErrorsMatch(report, 'TestContract', [/removed/])
    })
  })

  describe('when a variable is removed in a parent contract', () => {
    it('reports a removed variable', () => {
      const report = reportLayoutIncompatibilities(
        testCases.original,
        testCases.removed_from_parent
      )
      assertNotCompatible(report)
      assertContractErrorsMatch(report, 'TestContract', [/removed/])
    })
  })
})