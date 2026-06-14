import { describe, it, expect } from 'vitest'
import { inferParamType } from '@/components/system-parameters/ParamTypeBadge'

describe('inferParamType', () => {
  it('returns Boolean for "true"', () => {
    expect(inferParamType('true')).toBe('Boolean')
  })

  it('returns Boolean for "false"', () => {
    expect(inferParamType('false')).toBe('Boolean')
  })

  it('returns Boolean for "1"', () => {
    expect(inferParamType('1')).toBe('Boolean')
  })

  it('returns Boolean for "0"', () => {
    expect(inferParamType('0')).toBe('Boolean')
  })

  it('is case-insensitive for boolean values', () => {
    expect(inferParamType('TRUE')).toBe('Boolean')
    expect(inferParamType('False')).toBe('Boolean')
  })

  it('returns Number for integer strings', () => {
    expect(inferParamType('42')).toBe('Number')
    expect(inferParamType('100')).toBe('Number')
  })

  it('returns Number for decimal strings', () => {
    expect(inferParamType('3.14')).toBe('Number')
    expect(inferParamType('-5.5')).toBe('Number')
  })

  it('returns Number for negative numbers', () => {
    expect(inferParamType('-10')).toBe('Number')
  })

  it('returns Text for plain strings', () => {
    expect(inferParamType('hello')).toBe('Text')
    expect(inferParamType('some value')).toBe('Text')
  })

  it('returns Text for empty string', () => {
    expect(inferParamType('')).toBe('Text')
  })

  it('returns Text for whitespace-only strings', () => {
    expect(inferParamType('   ')).toBe('Text')
  })

  it('returns Text for mixed alphanumeric', () => {
    expect(inferParamType('abc123')).toBe('Text')
  })
})
