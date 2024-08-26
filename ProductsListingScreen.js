import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import * as Page from '@components/Page';
import Header from '@components/Header';
import Loading from '@components/Loading';
import DataBlock from '@components/DataBlock';
import Products from '@components/Products';
import FilterModal from '@components/FilterModel';
import SortingModel from '@components/SortingModel';
import CartItemsContext from '@contexts/CartItemsContext';
import u from '@utils/unit';
import Theme from '@constants/Theme';
import strings from '@constants/Strings';
import useProducts from '@hooks/useProducts';
import { getFilters } from '@services/Apis';
import { isObjectEmpty, sanitizedErrorMessage } from '@utils/CommonFunctions';
import Logger from '@services/Logger';

const ProductsListingScreen = (props) => {
  const { route, navigation } = props;
  const { id, type, slug } = route.params;
  const { cartItemsCounts, updateCartItemsCounts } = useContext(CartItemsContext);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortingFilters, setSortingFilters] = useState(false);
  const [orderId, setOrderId] = useState('ID');
  const [order, setOrder] = useState('desc');
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [filtersData, setFiltersData] = useState(null);
  const { data, refetch, fetchNextPage, hasNextPage, isFetching, status } = useProducts(
    id,
    type,
    appliedFilters,
    orderId,
    order
  );

  useEffect(() => {
    if (data) setLoading(false);
  }, [data]);

  useEffect(() => {
    if (appliedFilters) {
      refetch();
    }
  }, [appliedFilters, refetch]);

  useEffect(() => {
    refetch();
  }, [orderId, order, refetch]);

  const handleFiltersOnPress = useCallback(async () => {
    if (!filtersData) {
      try {
        setLoading(true);
        const response = await getFilters(slug, type === 'brand' ? type : '');

        if (response?.status === false)
          Alert.alert(strings.appTitle, sanitizedErrorMessage(response.message));
        else {
          setFiltersData(response);
          setShowFilters(true);
        }
      } catch (error) {
        Logger.error(error);
      } finally {
        setLoading(false);
      }
    } else setShowFilters(true);
  }, [filtersData, slug, type]);

  const applyFiltersOnPress = useCallback(async (selectedFilters) => {
    const { brandFilter, priceFilter, typeFilter, weightFilter } = selectedFilters;
    let filters = '';

    if (brandFilter && !isObjectEmpty(brandFilter)) {
      filters += `&pa_brand=${brandFilter?.term_id}`;
    }

    if (priceFilter && priceFilter?.length === 2) {
      filters += `&min_price=${priceFilter?.[0]}&max_price=${priceFilter?.[1]}`;
    }

    if (typeFilter && !isObjectEmpty(typeFilter)) {
      filters += `&pa_filters=${typeFilter?.term_id}`;
    }

    if (weightFilter && !isObjectEmpty(weightFilter)) {
      filters += `&pa_weight=${weightFilter?.term_id}`;
    }

    setAppliedFilters(filters);
  }, []);

  const renderProducts = (productsData) => {
    const { pages } = productsData;

    const mappedProducts = pages.map((page) => page.products);
    const products = mappedProducts.flat();

    return (
      <>
        <Products
          products={products}
          totalRecords={pages.[0].totalRecords}
          refetch={refetch}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetching={isFetching}
          wishList={false}
          updateLoading={(isLoading) => setLoading(isLoading)}
          sortingOnPress={() => setSortingFilters(true)}
          updateCartCounts={() => updateCartItemsCounts(cartItemsCounts + 1)}
        />

        <FilterModal
          showModal={showFilters}
          filtersData={filtersData}
          closeOnPress={() => setShowFilters(false)}
          applyFiltersOnPress={async (selectedFilters) => {
            setShowFilters(false);

            applyFiltersOnPress(selectedFilters);
          }}
        />

        <SortingModel
          showModal={sortingFilters}
          closeOnPress={() => setSortingFilters(false)}
          onSelect={async (selectedIndex) => {
            setSortingFilters(false);

            const selectedOption = strings.sortingOptions[selectedIndex];

            if (selectedOption) {
              setOrderId(selectedOption.orderId);
              setOrder(selectedOption.order);
            }
          }}
        />
      </>
    );
  };

  return (
    <>
      <Header
        title="Product Listing"
        filters
        filterersOnPress={handleFiltersOnPress}
        searchOnPress={() => navigation.navigate('SearchProducts')}
      />
      <Loading isLoading={loading} />
      <Page.BaseView>
        <DataBlock data={data} status={status} renderBlock={renderProducts} />
      </Page.BaseView>
    </>
  );
};

export const ProductsList = styled.FlatList`
  flex: 1;
`;
export const HeaderTitle = styled.Text`
  ${Theme.textStyles.body18SemiBold}
  text-align: left;
  color: ${(props) => (props.orange ? Theme.colors.orange : Theme.colors.black)};
  height: ${u(60)}px;
  line-height: ${u(60)}px;
  padding-left: ${u(20)};
`;

export default ProductsListingScreen;
