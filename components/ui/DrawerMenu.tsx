import React, { useState } from 'react';
import { Animated, ScrollView, View, TouchableOpacity, Text, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { styles, scale } from '../../app/(tabs)/home/styles';
import { useDrawer } from '../../context/DrawerContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';


// MAIN DRAWER NAVIGATION MENU
export function DrawerMenu() {


   // NAVIGATION AND CONTEXT INITIALIZATION
   const router = useRouter();
   const { slideAnim, toggleDrawer, isDrawerOpen } = useDrawer();
   const { logout } = useAuth();
   const [showGuidelines, setShowGuidelines] = useState(false);


   // HANDLE USER LOGOUT PROCESS
   const handleLogout = async () => {
     Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
       { text: 'Cancel', style: 'cancel' },
       {
         text: 'Logout',
         style: 'destructive',
         onPress: async () => {
           try {
             await logout();
             toggleDrawer(false);
             router.replace('/(auth)/login');
           } catch (error) {
             Alert.alert('Error', 'Failed to logout');
           }
         },
       },
     ]);
   };


   // CLEAR ALL LOG DOCUMENTS FROM FIRESTORE
   const handleClearLogs = async () => {
     Alert.alert(
       'Clear Logs',
       'Are you sure you want to delete all log documents? This action cannot be undone.',
       [
         { text: 'Cancel', style: 'cancel' },
         {
           text: 'Clear All',
           style: 'destructive',
           onPress: async () => {
             try {
               const logsCol = collection(db, 'logs');
               const snapshot = await getDocs(logsCol);
               const deletePromises = snapshot.docs.map((document) => 
                 deleteDoc(doc(db, 'logs', document.id))
               );
               await Promise.all(deletePromises);
               Alert.alert('Success', 'All logs have been cleared.');
             } catch (error) {
               console.error(error);
               Alert.alert('Error', 'Failed to clear logs.');
             }
           },
         },
       ]
     );
   };


   // DATA: COMMUNITY GUIDELINES LIST
   const guidelines = [
     "Be respectful to other users",
     "Return items on time and in good condition",
     "No fake listings or scams",
     "Only use external payment at your own risk",
     "Report suspicious behavior immediately"
   ];


   // DRAWER AND MODAL COMPONENTS
   return (
     <>

       {/* UI: BACKDROP OVERLAY WHEN DRAWER IS OPEN */}
       {isDrawerOpen && (
         <TouchableOpacity
           activeOpacity={1}
           onPress={() => toggleDrawer(false)}
           style={styles.backdrop}
         />
       )}

       {/* ANIMATED DRAWER CONTAINER */}
       <Animated.View
         pointerEvents={isDrawerOpen ? 'auto' : 'none'}
         style={[
           styles.drawer,
           { 
             transform: [{ translateX: slideAnim }], 
             zIndex: 999,
             opacity: isDrawerOpen ? 1 : 0 
           },
         ]}
       >

         {/* DRAWER HEADER SECTION */}
         <View style={styles.drawerHeader}>
           <Text style={[styles.logoMini, { fontWeight: 700 }]}>
             <Text style={{ color: '#FFFFFF' }}>Cross</Text>
             <Text style={{ color: '#ffffff' }}>Rent</Text>
           </Text>
           <TouchableOpacity onPress={() => toggleDrawer(false)}>
             <Ionicons name="close-outline" size={28} color="#FFFFFF" />
           </TouchableOpacity>
         </View>

         {/* DRAWER NAVIGATION ITEMS SECTION */}
         <ScrollView style={styles.drawerItems}>
           <TouchableOpacity
             style={styles.drawerItem}
             onPress={() => {
               toggleDrawer(false);
               router.push('/profile' as any);
             }}
           >
             <Ionicons name="person-outline" size={22} color="#FFFFFF" />
             <Text style={styles.drawerItemText}>Profile</Text>
           </TouchableOpacity>

           <TouchableOpacity
             style={styles.drawerItem}
             onPress={() => {
               toggleDrawer(false);
               router.push({ pathname: '/my-listing' as any });
             }}
           >
             <Ionicons name="list-outline" size={22} color="#FFFFFF" />
             <Text style={styles.drawerItemText}>My Listing</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={styles.drawerItem}
             onPress={() => setShowGuidelines(true)}
           >
             <Ionicons name="shield-checkmark-outline" size={22} color="#FFFFFF" />
             <Text style={styles.drawerItemText}>Community Guidelines</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={styles.drawerItem}
             onPress={handleClearLogs}
           >
             <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
             <Text style={styles.drawerItemText}>Clear Logs</Text>
           </TouchableOpacity>

           <TouchableOpacity
             style={[styles.drawerItem, { marginTop: 20 }]}
             onPress={handleLogout}
           >
             <Ionicons name="log-out-outline" size={22} color="#ffffff" />
             <Text style={[styles.drawerItemText, { color: '#ffffff' }]}>Logout</Text>
           </TouchableOpacity>
         </ScrollView>
       </Animated.View>

       {/* COMMUNITY GUIDELINES MODAL */}
       <Modal
         visible={showGuidelines}
         animationType="slide"
         transparent={false}
         onRequestClose={() => setShowGuidelines(false)}
       >
         <SafeAreaView style={styles.modalContainer}>
           
           {/* MODAL HEADER SECTION */}
           <View style={styles.modalHeader}>
             <TouchableOpacity onPress={() => setShowGuidelines(false)} style={styles.modalCloseBtn}>
               <Ionicons name="arrow-back" size={scale(24)} color="#222D31" />
             </TouchableOpacity>
             <Text style={[styles.modalHeaderTitle, { marginLeft: scale(15) }]}>
               Community Guidelines
             </Text>
           </View>

           {/* MODAL CONTENT SCROLLVIEW SECTION */}
           <ScrollView contentContainerStyle={styles.modalInfoSection}>
             <View style={[styles.infoCard, { padding: scale(20), borderColor: '#F0F0F0', borderWidth: 1 }]}>
               <Text style={[styles.detailLabel, { color: '#222D31', marginBottom: scale(20), fontWeight: 700 }]}>
                 App Rules & Safety
               </Text>
                      
               {/* GUIDELINE RULES MAPPING */}
               {guidelines.map((rule, index) => (
                 <View key={index} style={{ flexDirection: 'row', marginBottom: scale(15), alignItems: 'flex-start' }}>
                   <Ionicons name="checkmark-circle" size={scale(18)} color="#27AE60" style={{ marginTop: 2 }} />
                   <Text style={[styles.detailValue, { flex: 1, marginLeft: scale(10), marginBottom: 0 }]}>
                     {rule}
                   </Text>
                 </View>
               ))}

               <View style={{ width: '100%' }}>
                 <View style={[styles.divider, { marginHorizontal: -scale(20), marginTop: scale(20) }]} />
               </View>

               <Text style={[styles.detailLabel, { fontWeight: 700 }]}>Contact Support</Text>
               <Text style={styles.detailValue}>
                 For concerns or to contact the owner/admin of the app, please email:
               </Text>
               
               <TouchableOpacity style={styles.contactRow}>
                 <Ionicons name="mail-outline" size={scale(20)} color="#AF0B01" />
                 <Text style={styles.detailValueContact}>ahrone.ambasan@hcdc.edu.ph</Text>
               </TouchableOpacity>
             </View>
           </ScrollView>

           {/* MODAL FOOTER ACTION SECTION */}
           <View style={[styles.modalFooter, { paddingBottom: Platform.OS === 'ios' ? 30 : 20 }]}>
             <TouchableOpacity
               style={[
                 styles.messageBtn,
                 { borderRadius: scale(50) }
               ]}
               onPress={() => setShowGuidelines(false)}
             >
               <Ionicons 
                 name="checkmark-done-outline" 
                 size={scale(20)} 
                 color="#FFFFFF" 
                 style={{ marginRight: 8 }} 
               />
               <Text style={styles.messageBtnText}>I Understand</Text>
             </TouchableOpacity>
           </View>

         </SafeAreaView>
       </Modal>
     </>
   );
}