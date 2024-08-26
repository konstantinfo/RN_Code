import React, { memo, useContext, useMemo } from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import {
  Wrapper,
  RowWrapper,
  TouchableButton,
  ProductContainer,
  ProductImage,
  ProductTitle,
  TextLarge,
  TextSmall,
} from '@components/Common';
import u from '@utils/unit';
import Theme, { SCREEN_WIDTH } from '@constants/Theme';
import ImagePath from '@constants/ImagePath';
import AppContext from '@contexts/AppContext';

const ProductItem = memo(({ data, relatedProducts, cartOnPress }) => {
  const { newArrival } = useContext(AppContext);
  const navigation = useNavigation();
  const { id, name, price, images, image, categories, product_stock_status } = data;

  // Memoized categoriesString to avoid unnecessary recalculations
  const categoriesString = useMemo(
    () => categories?.map((category) => category?.name).join(', '),
    [categories]
  );

  const isOutOfStock = product_stock_status === 'outofstock';

  return (
    <ProductContainer
      width={relatedProducts ? SCREEN_WIDTH / 2 : '49%'}
      onPress={() => navigation.navigate('ProductDetail', { productId: id })}
    >
      <ProductImage source={{ uri: images ? images[0]?.src : image }} />
      {isOutOfStock && (
        <SoldOutWrapper>
          <OutofStockText>Sold Out</OutofStockText>
        </SoldOutWrapper>
      )}
      {newArrival && <NewIcon source={ImagePath.newIcon} />}
      <Wrapper backgroundColor={Theme.colors.ivory} width="95%">
        <Wrapper paddingVertical={Theme.space.xsmall}>
          <ProductTitle numberOfLines={1}>{name}</ProductTitle>
          <RowWrapper marginHorizontal={Theme.space.xxsmall}>
            <RowContainer flex={1}>
              <TextSmall numberOfLines={1}>{categoriesString}</TextSmall>
            </RowContainer>
            <RowContainer>
              <TextLarge>{`AED ${price}`}</TextLarge>
            </RowContainer>
          </RowWrapper>
        </Wrapper>
      </Wrapper>
      {!isOutOfStock && (
        <TouchableButton onPress={() => cartOnPress(id)}>
          <CartIcon source={ImagePath.cartIcon} />
        </TouchableButton>
      )}
    </ProductContainer>
  );
});

// Styled components
const RowContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${u(3)};
  align-items: flex-end;
`;

const NewIcon = styled.Image`
  position: absolute;
  top: ${u(8)};
`;

const CartIcon = styled.Image`
  position: absolute;
  right: ${u(15)};
  bottom: ${u(60)};
  border-width: 1;
`;

export const SoldOutWrapper = styled.View`
  position: absolute;
  justify-content: center;
  align-self: center;
  height: ${u(166)}px;
  background-color: rgba(255, 255, 255, 0.7);
  width: 88%;
`;

export const OutofStockText = styled.Text`
  ${Theme.textStyles.body14SemiBold}
  background-color: ${Theme.colors.darkGrey};
  color: ${Theme.colors.white};
  padding: 6px;
  width: 90px;
`;

export default ProductItem;
