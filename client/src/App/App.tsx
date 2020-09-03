import React, { PropsWithChildren } from 'react';
import styled from '@emotion/styled'

interface props {
  style?: React.CSSProperties,
  
};

const App : React.FC<PropsWithChildren<props>> = () => {

  return (
    <Wrapper data-css='App'>
      App
    </Wrapper>
  )
}

export default App;

const Wrapper = styled('div')`

`;