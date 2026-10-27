import assert from 'node:assert/strict'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { evaluatePrAlignment, hasAlignmentEscape } from '../scripts/check-pr-alignment.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')

test('hasAlignmentEscape respects label and body marker', () => {
  assert.equal(hasAlignmentEscape({ prLabels: ['alignment-exempt'], prBody: '' }), true)
  assert.equal(hasAlignmentEscape({ prLabels: [], prBody: 'Alignment: docs-only\n- checked roots' }), true)
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
