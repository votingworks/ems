import CastVoteRecordFiles from './CastVoteRecordFiles'

test('adds a single CVR file', async () => {
  const file = new File(['{"_ballotId": "1", "_precinctId": "23"}'], 'cvrs.txt')
  const cvrFiles = await CastVoteRecordFiles.empty.add(file)

  expect(cvrFiles.fileList).toEqual([
    { name: 'cvrs.txt', count: 1, precinctIds: ['23'] },
  ])
})

test('adds multiple CVR files', async () => {
  const file1 = new File(
    ['{"_ballotId": "1", "_precinctId": "23"}'],
    'cvrs1.txt'
  )
  const file2 = new File(
    [
      '{"_ballotId": "2", "_precinctId": "23"}\n{"_ballotId": "3", "_precinctId": "23"}',
    ],
    'cvrs2.txt'
  )
  const cvrFiles = await CastVoteRecordFiles.empty.addAll([file1, file2])

  expect(cvrFiles.fileList).toEqual([
    { name: 'cvrs1.txt', count: 1, precinctIds: ['23'] },
    { name: 'cvrs2.txt', count: 2, precinctIds: ['23'] },
  ])
})

test('adds duplicated files to the `duplicatedFiles` property', async () => {
  const file = new File(['{"_ballotId": "1"}'], 'cvrs.txt')
  const cvrFiles = await CastVoteRecordFiles.empty.addAll([file, file])

  expect(cvrFiles.duplicateFiles).toEqual(['cvrs.txt'])
})

test('records the last file that fails to parse', async () => {
  const file = new File(['I am not JSON'], 'not-json.txt')
  const cvrFiles = await CastVoteRecordFiles.empty.add(file)

  expect(cvrFiles.errorFile).toEqual('not-json.txt')
})

test('records all parsed cast vote records', async () => {
  const file1 = new File(
    ['{"_ballotId": "1", "_precinctId": "23"}'],
    'cvrs1.txt'
  )
  const file2 = new File(
    [
      '{"_ballotId": "2", "_precinctId": "23"}\n{"_ballotId": "3", "_precinctId": "24"}',
    ],
    'cvrs2.txt'
  )
  const cvrFiles = await CastVoteRecordFiles.empty.addAll([file1, file2])

  expect(cvrFiles.castVoteRecords).toEqual([
    { _ballotId: '1', _precinctId: '23' },
    { _ballotId: '2', _precinctId: '23' },
    { _ballotId: '3', _precinctId: '24' },
  ])
})
