import styled from 'styled-components'

interface Props {
  textCenter?: boolean
  compact?: boolean
  marginBottom?: boolean
  maxWidth?: boolean
}

const Prose = styled('div')<Props>`
  margin-right: ${({ textCenter }) => (textCenter ? 'auto' : undefined)};
  margin-bottom: ${({ marginBottom }) => (marginBottom ? '1rem' : undefined)};
  margin-left: ${({ textCenter }) => (textCenter ? 'auto' : undefined)};
  max-width: ${({ maxWidth = true }) => (maxWidth ? '66ch' : undefined)};
  text-align: ${({ textCenter }) => (textCenter ? 'center' : undefined)};
  line-height: 1.2;
  @media (min-width: 480px) {
    line-height: 1.3;
  }
  & h1 {
    margin: ${({ compact }) => (compact ? 0 : '2.5rem 0 1rem')};
    line-height: 1.1;
    font-size: 1.5rem;
  }
  & h2 {
    margin: ${({ compact }) => (compact ? 0 : '2rem 0 0.75rem')};
    font-size: 1.25rem;
  }
  & h3,
  & p,
  & table {
    margin: ${({ compact }) => (compact ? 0 : '1rem 0')};
    font-size: 1rem;
  }
  & h1 + p,
  & h2 + p {
    margin-top: ${({ compact }) => (compact ? 0 : '-0.75rem')};
  }
  & h1 + table,
  & h2 + table,
  & h3 + table {
    margin-top: ${({ compact }) => (compact ? 0 : '-0.25rem')};
  }
  & h3 + p {
    margin-top: ${({ compact }) => (compact ? 0 : '-1rem')};
  }
  & :first-child {
    margin-top: 0;
  }
  & :last-child {
    margin-bottom: 0;
  }
`

export default Prose
