import React from 'react'
import styled, { css } from 'styled-components'

interface Attrs extends HTMLButtonElement {
  readonly type: string
}

export interface ButtonInterface {
  readonly danger?: boolean
  readonly primary?: boolean
  readonly fullWidth?: boolean
  readonly small?: boolean
}

interface Props
  extends ButtonInterface,
    React.PropsWithoutRef<JSX.IntrinsicElements['button']> {}

export const buttonFocusStyle = css`
  outline: rgb(77, 144, 254) dashed 0.25rem;
`

export const buttonStyles = css<Props>`
  display: inline-block;
  border: none;
  border-radius: 0.25rem;
  box-sizing: border-box;
  background: ${({ danger = false, disabled = false, primary = false }) =>
    (disabled && 'rgb(211, 211, 211)') ||
    (danger && 'red') ||
    (primary && 'rgb(71, 167, 75)') ||
    'rgb(211, 211, 211)'};
  cursor: ${({ disabled = false }) => (disabled ? undefined : 'pointer')};
  width: ${({ fullWidth = false }) => (fullWidth ? '100%' : undefined)};
  padding: ${({ small = false }) =>
    small ? '0.35rem 0.5rem' : '0.75rem 1rem'};
  line-height: 1;
  white-space: nowrap;
  color: ${({ danger = false, disabled = false, primary = false }) =>
    (disabled && 'rgb(169, 169, 169)') ||
    (danger && '#FFFFFF') ||
    (primary && '#FFFFFF') ||
    'black'};
  &:focus {
    ${buttonFocusStyle}
  }
  &:hover,
  &:active {
    outline: none;
  }
`

export const DecoyButton = styled.div`
  ${buttonStyles}
`

const Button = styled.button.attrs(({ type = 'button' }: Attrs) => ({
  type,
}))`
  ${buttonStyles}
`

export const LabelButton = styled.label`
  ${buttonStyles}
`

export default Button
