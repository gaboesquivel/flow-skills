import assert from 'node:assert/strict'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { evaluatePrAlignment, hasAlignmentEscape, parseNameStatus } from '../scripts/check-pr-alignment.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')

test('hasAlignmentEscape respects label and a root-only docs-only line', () => {
  assert.equal(hasAlignmentEscape({ prLabels: ['alignment-exempt'], prBody: '' }), true)
  assert.equal(
    hasAlignmentEscape({
      prLabels: [],
      prBody: 'Alignment: docs-only\n- checked roots',
      changedFiles: ['GLOSSARY.md'],
    }),
    true,
  )
  assert.equal(
    hasAlignmentEscape({
      prLabels: [],
      prBody: 'See Alignment: docs-only in the notes',
      changedFiles: ['GLOSSARY.md'],
    }),
    false,
  )
  assert.equal(hasAlignmentEscape({ prLabels: [], prBody: 'no marker' }), false)
})

test('skill SKILL.md change requires smoke-contracts update', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['skills/review/SKILL.md'],
    repoRoot: root,
  })
  assert.ok(errors.some((e) => /smoke-contracts/u.test(e)))
})

test('skill SKILL.md with smoke-contracts update passes contract rule', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['skills/review/SKILL.md', 'tests/smoke-contracts.test.mjs'],
    repoRoot: root,
  })
  assert.equal(errors.filter((e) => /smoke-contracts/u.test(e)).length, 0)
})

test('stale catalog ship pipeline phrase fails alignment on touched catalog file', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['README.md'],
    repoRoot: root,
  })
  assert.equal(errors.filter((e) => /stale ship pipeline/u.test(e)).length, 0)
})

test('root context change requires spec or decision in PR', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['PRODUCT.md'],
    repoRoot: root,
  })
  assert.ok(errors.some((e) => /Root context/u.test(e)))
})

test('root context with spec in same PR passes', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['PRODUCT.md', 'docs/specs/004-pr-alignment-review.md'],
    repoRoot: root,
  })
  assert.equal(errors.filter((e) => /Root context/u.test(e)).length, 0)
})

test('Alignment docs-only exempts root context rule', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['GLOSSARY.md'],
    prBody: 'Alignment: docs-only',
    repoRoot: root,
  })
  assert.equal(errors.filter((e) => /Root context/u.test(e)).length, 0)
})

test('new decision requires README update', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['docs/decisions/0010-example.md'],
    statusByPath: { 'docs/decisions/0010-example.md': 'added' },
    repoRoot: root,
  })
  assert.ok(errors.some((e) => /decisions\/README/u.test(e)))
})

test('quoted docs-only marker does not exempt a mixed pull request', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['skills/review/SKILL.md', 'PRODUCT.md'],
    prBody: 'See the contract: Alignment: docs-only is only for root docs.',
    repoRoot: root,
  })
  assert.ok(errors.some((e) => /smoke-contracts/u.test(e)))
  assert.ok(errors.some((e) => /Root context/u.test(e)))
})

test('docs-only line does not exempt skill contract changes', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['GLOSSARY.md', 'skills/review/SKILL.md'],
    prBody: 'Alignment: docs-only',
    repoRoot: root,
  })
  assert.ok(errors.some((e) => /smoke-contracts/u.test(e)))
})

test('new spec must be named in the specs index even when the index changes', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['docs/specs/099-new-spec.md', 'docs/specs/README.md'],
    statusByPath: { 'docs/specs/099-new-spec.md': 'added', 'docs/specs/README.md': 'M' },
    repoRoot: root,
  })
  assert.ok(errors.some((e) => /099-new-spec/u.test(e)))
})

test('new decision must be named in the decisions index even when the index changes', () => {
  const { errors } = evaluatePrAlignment({
    changedFiles: ['docs/decisions/0099-example.md', 'docs/decisions/README.md'],
    statusByPath: { 'docs/decisions/0099-example.md': 'added', 'docs/decisions/README.md': 'M' },
    repoRoot: root,
  })
  assert.ok(errors.some((e) => /0099-example/u.test(e)))
})

test('rename status keeps the old root context path', () => {
  const { files, statusByPath } = parseNameStatus('R100\tPRODUCT.md\tdocs/PRODUCT-moved.md')
  const { errors } = evaluatePrAlignment({ changedFiles: files, statusByPath, repoRoot: root })
  assert.ok(files.includes('PRODUCT.md'))
  assert.equal(statusByPath['docs/PRODUCT-moved.md'], 'added')
  assert.ok(errors.some((e) => /PRODUCT.md/u.test(e)))
})
