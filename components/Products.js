import React, { memo, useCallback, useState } from "react";
import { ActivityIndicator, Alert, Keyboard } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  RowWrapper,
  FooterContainer,
  HeaderTitle,
  ProductsList,
} from "@components/Common";
import CartPreviewModel from "@components/CartPreviewModel";
import OptionModel from "@components/OptionModel";
import { IconWrapper } from "@components/Header";
import ProductItem from "@components/ProductItem";
import * as API from "@services/Apis";
import { sanitizedErrorMessage } from "@utils/CommonFunctions";
import Theme from "@constants/Theme";
import strings from "@constants/Strings";

// Memoized Products component
const Products = memo(
  ({
    products,
    totalRecords,
    hasNextPage,
    fetchNextPage,
    isFetching,
    refetch,
    wishList,
    updateLoading,
    updateCartCounts,
    sortingOnPress,
  }) => {
    // Local states for managing UI and data
    const [showOptions, setShowOptions] = useState(false); // State for showing options modal
    const [showCartPreview, setShowCartPreview] = useState(false); // State for showing cart preview modal
    const [productId, setProductId] = useState(null); // State for selected product ID
    const [productVariant, setProductVariant] = useState([]); // State for product variants
    const [variantData, setVariantData] = useState([]); // State for variant data
    const [cartData, setCartData] = useState([]); // State for cart data
    const [
      onEndReachedCalledDuringMomentum,
      setOnEndReachedCalledDuringMomentum,
    ] = useState(true); // State for managing scroll momentum
    const navigation = useNavigation();

    // Function to fetch cart data
    const apiRequestToGetCart = useCallback(async () => {
      try {
        const response = await API.getCart();
        const { status, message } = response;

        if (status) {
          setCartData(response);
          setTimeout(() => setShowCartPreview(true), 300); // Delay showing cart preview for a smooth experience
        } else {
          Alert.alert(strings.appTitle, sanitizedErrorMessage(message));
        }
      } catch (e) {
        Alert.alert(strings.appTitle, sanitizedErrorMessage(e.message));
      } finally {
        updateLoading(false);
      }
    }, [updateLoading]);

    // Function to handle adding product to cart
    const handleAddToCartOnPress = useCallback(
      async (productVariant, variation_id, product_id) => {
        if (productVariant?.length > 0) {
          setShowOptions(true); // Show options modal if product has variants
          updateLoading(false);
        } else {
          try {
            const response = await API.addProductToCart({
              product_id,
              quantity: 1,
              variation_id,
            });

            if (response?.status === false) {
              Alert.alert(
                strings.appTitle,
                sanitizedErrorMessage(response.message)
              );
            } else {
              updateCartCounts(); // Update cart count
              apiRequestToGetCart(); // Refresh cart data
            }
          } catch (e) {
            Alert.alert(strings.appTitle, sanitizedErrorMessage(e.message));
          } finally {
            updateLoading(false);
          }
        }
      },
      [apiRequestToGetCart, updateCartCounts, updateLoading]
    );

    // Function to fetch product details
    const requestToGetProductDetail = useCallback(
      async (product_id) => {
        updateLoading(true);
        try {
          const response = await API.getProductDetail(product_id);
          const { status, message, data } = response;

          if (status) {
            const { product_variant, product_variant_data } = data;
            setProductId(product_id);
            setProductVariant(product_variant);
            setVariantData(product_variant_data);
            handleAddToCartOnPress(product_variant, "", product_id); // Add product to cart
          } else {
            Alert.alert(strings.appTitle, sanitizedErrorMessage(message));
          }
        } catch (e) {
          Alert.alert(strings.appTitle, sanitizedErrorMessage(e.message));
        } finally {
          updateLoading(false);
        }
      },
      [handleAddToCartOnPress, updateLoading]
    );

    // Function to handle pagination and fetch next page
    const onEndReached = () => {
      if (!onEndReachedCalledDuringMomentum && hasNextPage) {
        fetchNextPage(); // Fetch next page of products
        setOnEndReachedCalledDuringMomentum(true);
      }
    };

    // Function to render footer component with loading indicator
    const renderFooter = () => {
      if (!hasNextPage || !isFetching) return null;
      return (
        <FooterContainer>
          <ActivityIndicator size="small" color={Theme.colors.primary} />
        </FooterContainer>
      );
    };

    // Function to render each product item
    const renderProductsListItem = ({ item }) => (
      <ProductItem
        data={item}
        cartOnPress={(productID) => requestToGetProductDetail(productID)}
      />
    );

    return (
      <>
        <RowWrapper>
          <HeaderTitle>
            {totalRecords === 0
              ? "No Products Found"
              : `${totalRecords} Products Found`}
          </HeaderTitle>
          {!wishList && (
            <IconWrapper onPress={sortingOnPress}>
              <Icon name="filter" size={24} color="black" />
            </IconWrapper>
          )}
        </RowWrapper>

        <ProductsList
          numColumns={2}
          data={products}
          renderItem={renderProductsListItem}
          onRefresh={refetch}
          refreshing={isFetching}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          keyExtractor={(item) => item.id}
          onScrollBeginDrag={() => Keyboard.dismiss()} // Dismiss keyboard on scroll
          onMomentumScrollBegin={() =>
            setOnEndReachedCalledDuringMomentum(false)
          }
          contentContainerStyle={{
            marginHorizontal: Theme.space.xxsmall,
            paddingBottom: Theme.space.small,
          }}
        />

        {/* Option Model for selecting product variants */}
        <OptionModel
          showModal={showOptions}
          optionType={variantData}
          options={productVariant}
          closeOnPress={() => setShowOptions(false)}
          doneOnPress={(variation_id) => {
            setShowOptions(false);
            updateLoading(true);
            handleAddToCartOnPress([], variation_id, productId); // Add selected variant to cart
          }}
        />

        {/* Cart Preview Model for showing cart summary */}
        <CartPreviewModel
          showModal={showCartPreview}
          cartData={cartData}
          updateLoading={updateLoading}
          onUpdateCompleted={apiRequestToGetCart}
          closeOnPress={() => setShowCartPreview(false)}
          viewCartOnPress={() => {
            setShowCartPreview(false);
            navigation.navigate("Cart");
          }}
          checkOutOnPress={() => {
            setShowCartPreview(false);
            navigation.navigate("Payment");
          }}
        />
      </>
    );
  }
);

export default Products;
