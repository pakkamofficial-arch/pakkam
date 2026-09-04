import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setMonthlyLists,
  setTemplates,
  setActiveList,
} from '../redux/slices/monthlyGrocerySlice';
import { setCartData } from '../redux/slices/cartSlice';
import client from '../api/client';

export const MonthlyGroceryListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { lists, templates, activeList } = useSelector(
    (state: RootState) => state.monthlyGrocery
  );
  const { products } = useSelector((state: RootState) => state.products);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [listName, setListName] = useState('September Monthly Grocery');
  const [selectedFamilySize, setSelectedFamilySize] = useState('Family of 4');

  const [addingToCart, setAddingToCart] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState('');

  useEffect(() => {
    fetchListsAndTemplates();
  }, []);

  const fetchListsAndTemplates = async () => {
    try {
      const tRes = await client.get('/monthly-grocery/templates');
      if (tRes.data.success) dispatch(setTemplates(tRes.data.templates));

      const lRes = await client.get('/monthly-grocery');
      if (lRes.data.success) {
        dispatch(setMonthlyLists(lRes.data.lists));
        if (lRes.data.lists.length > 0 && !activeList) {
          fetchListDetail(lRes.data.lists[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchListDetail = async (id: string) => {
    try {
      const res = await client.get(`/monthly-grocery/${id}`);
      if (res.data.success) {
        dispatch(setActiveList(res.data.list));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewList = async () => {
    try {
      const res = await client.post('/monthly-grocery', {
        name: listName || 'Monthly Grocery',
        month: 'September 2026',
        familySize: selectedFamilySize,
      });

      if (res.data.success) {
        setShowCreateModal(false);
        fetchListsAndTemplates();
        dispatch(setActiveList(res.data.list));
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create monthly list');
    }
  };

  const handleDuplicateList = async (id: string) => {
    try {
      const res = await client.post(`/monthly-grocery/${id}/duplicate`, {
        newName: `October Monthly Grocery`,
        newMonth: 'October 2026',
      });
      if (res.data.success) {
        alert('List duplicated successfully as October Monthly Grocery!');
        fetchListsAndTemplates();
        dispatch(setActiveList(res.data.list));
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to duplicate list');
    }
  };

  const handleUpdateItemQty = async (productId: string, newQty: number) => {
    if (!activeList) return;
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const updatedItems = activeList.items.map((item: any) => {
      const pId = item.product?._id || item.product;
      if (pId.toString() === productId.toString()) {
        return { ...item, quantity: newQty };
      }
      return item;
    });

    try {
      const res = await client.put(`/monthly-grocery/${activeList._id}`, {
        items: updatedItems,
      });
      if (res.data.success) {
        dispatch(setActiveList(res.data.list));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!activeList) return;
    const updatedItems = activeList.items.filter((item: any) => {
      const pId = item.product?._id || item.product;
      return pId.toString() !== productId.toString();
    });

    try {
      const res = await client.put(`/monthly-grocery/${activeList._id}`, {
        items: updatedItems,
      });
      if (res.data.success) {
        dispatch(setActiveList(res.data.list));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProductToList = async (prod: any) => {
    if (!activeList) return;
    try {
      const res = await client.post(`/monthly-grocery/${activeList._id}/add-item`, {
        productId: prod._id,
        quantity: 1,
        unit: prod.unit || '1 kg',
      });
      if (res.data.success) {
        dispatch(setActiveList(res.data.list));
        setShowAddProductModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAllToCart = async () => {
    if (!activeList || activeList.items.length === 0) return;
    try {
      setAddingToCart(true);
      const res = await client.post(`/monthly-grocery/${activeList._id}/add-to-cart`);
      if (res.data.success) {
        const cartRes = await client.get('/cart');
        if (cartRes.data.success) {
          dispatch(
            setCartData({
              items: cartRes.data.cart.items || [],
              subtotal: cartRes.data.subtotal || 0,
              deliveryFee: cartRes.data.deliveryFee || 0,
            })
          );
        }
        alert(res.data.message || 'All items added to cart!');
        navigation.navigate('Cart');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to add items to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const filteredProductsToSelect = products.filter((p) =>
    p.name.toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Monthly Grocery List</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
            <Text style={styles.createBtnText}>+ New List</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Lists Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listsTabRow}>
          {lists.map((l) => (
            <TouchableOpacity
              key={l._id}
              style={[styles.listTab, activeList?._id === l._id && styles.activeListTab]}
              onPress={() => fetchListDetail(l._id)}
            >
              <Text style={[styles.listTabText, activeList?._id === l._id && styles.activeListTabText]}>
                {l.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active List View */}
        {activeList ? (
          <View>
            <View style={styles.activeHeaderCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{activeList.name}</Text>
                <Text style={styles.listMeta}>
                  {activeList.month} • {activeList.familySize || 'Custom'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.duplicateBtn}
                onPress={() => handleDuplicateList(activeList._id)}
              >
                <Text style={styles.duplicateBtnText}>📋 Duplicate</Text>
              </TouchableOpacity>
            </View>

            {/* Estimated Total Card */}
            <View style={styles.totalCard}>
              <View>
                <Text style={styles.totalCardLabel}>Estimated Monthly Total</Text>
                <Text style={styles.totalCardValue}>₹{activeList.estimatedTotal || 0}</Text>
              </View>
              <TouchableOpacity
                style={styles.addProductsBtn}
                onPress={() => setShowAddProductModal(true)}
              >
                <Text style={styles.addProductsBtnText}>+ Add Item</Text>
              </TouchableOpacity>
            </View>

            {/* Items List */}
            {activeList.items?.length === 0 ? (
              <View style={styles.emptyListCard}>
                <Text style={{ fontSize: 32 }}>🧺</Text>
                <Text style={styles.emptyListTitle}>Your monthly list is empty</Text>
                <Text style={styles.emptyListSub}>Add items like Rice, Toor Dal, Sunflower Oil & Sugar.</Text>
                <TouchableOpacity
                  style={styles.addProductsBtn}
                  onPress={() => setShowAddProductModal(true)}
                >
                  <Text style={styles.addProductsBtnText}>+ Add Grocery Items</Text>
                </TouchableOpacity>
              </View>
            ) : (
              activeList.items.map((item: any) => {
                const prod = item.product || {};
                const pId = prod._id || item.product;

                return (
                  <View key={item._id || pId} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>₹{item.priceAtCreation} / {item.unit}</Text>
                    </View>

                    <View style={styles.qtyBox}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateItemQty(pId, item.quantity - 1)}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyVal}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateItemQty(pId, item.quantity + 1)}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={{ paddingLeft: 10 }}
                      onPress={() => handleRemoveItem(pId)}
                    >
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}

            {/* Core Action: ADD ALL TO CART */}
            {activeList.items?.length > 0 && (
              <TouchableOpacity
                style={styles.addAllBtn}
                onPress={handleAddAllToCart}
                disabled={addingToCart}
              >
                <Text style={styles.addAllBtnText}>
                  {addingToCart ? 'Adding All Items to Cart...' : '🛒 ADD ALL TO CART'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Create New List Modal with Family Templates */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Monthly Grocery List</Text>

            <Text style={styles.inputLabel}>List Name</Text>
            <TextInput
              style={styles.modalInput}
              value={listName}
              onChangeText={setListName}
              placeholder="e.g. September Monthly Grocery"
            />

            <Text style={styles.inputLabel}>Choose Starter Family Template (Optional):</Text>
            <View style={styles.templateOptions}>
              {['Family of 2', 'Family of 4', 'Family of 6', 'Custom Empty'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.templateChip,
                    selectedFamilySize === size && styles.activeTemplateChip,
                  ]}
                  onPress={() => setSelectedFamilySize(size)}
                >
                  <Text
                    style={[
                      styles.templateChipText,
                      selectedFamilySize === size && styles.activeTemplateChipText,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateNewList}
              >
                <Text style={styles.submitBtnText}>Create List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Product Modal */}
      <Modal visible={showAddProductModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>Add Product to Monthly List</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Search product (Rice, Dal, Oil, Sugar...)"
              value={searchProductQuery}
              onChangeText={setSearchProductQuery}
            />

            <FlatList
              data={filteredProductsToSelect}
              keyExtractor={(item) => item._id}
              style={{ marginVertical: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchProdRow}
                  onPress={() => handleAddProductToList(item)}
                >
                  <Text style={styles.searchProdName}>{item.name}</Text>
                  <Text style={styles.searchProdPrice}>₹{item.discountPrice || item.price} / {item.unit}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAddProductModal(false)}
            >
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  createBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  listsTabRow: {
    marginBottom: 16,
  },
  listTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  activeListTab: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  listTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activeListTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  activeHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803d',
  },
  listMeta: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  duplicateBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  duplicateBtnText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '700',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  totalCardLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  totalCardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16a34a',
  },
  addProductsBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addProductsBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyListCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptyListSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemPrice: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#cbd5e1',
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  qtyVal: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
  },
  addAllBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 30,
    elevation: 2,
  },
  addAllBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  templateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  activeTemplateChip: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  templateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeTemplateChipText: {
    color: '#15803d',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  cancelBtnText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  searchProdRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchProdName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  searchProdPrice: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '700',
  },
});
