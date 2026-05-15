import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../../firebase';
import s from '../../add-listing/styles';

export default function EditItemScreen() {
    const router = useRouter();
    const { itemId } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [rentalPeriod, setRentalPeriod] = useState('Day');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const categories = ['Laptop', 'Books', 'Tech', 'Calculators', 'Lab Gear'];
    const statusOptions = ['Available', 'Reserved', 'Rented'];
    const durationOptions = ['Hour', 'Day', 'Week', 'Month'];

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const docRef = doc(db, 'items', itemId as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name);
                    setPrice(data.price.replace('₱', ''));
                    setRentalPeriod(data.rentalPeriod || 'Day');
                    setDescription(data.description);
                    setLocation(data.location);
                    setCategory(data.category);
                    setStatus(data.status);
                    setImageUrl(data.imageUrl);
                }
            } catch (e) {
                console.error(e);
                Alert.alert("Error", "Could not load item details.");
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [itemId]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery access required.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });
        if (!result.canceled && result.assets[0].base64) {
            setImageUrl(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleUpdate = async () => {
        if (!name.trim() || !price.trim() || !description.trim() || !location.trim() || !category || !status || !imageUrl) {
            return Alert.alert("Incomplete Form", "Please fill out all fields.");
        }
        try {
            const docRef = doc(db, 'items', itemId as string);
            await updateDoc(docRef, {
                name: name.trim(),
                price: `₱${price.trim()}`,
                rentalPeriod: rentalPeriod,
                description: description.trim(),
                category: category,
                location: location.trim(),
                status: status,
                imageUrl: imageUrl,
            });
            Alert.alert("Success", "Listing updated successfully!");
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to update listing.");
        }
    };

    // Header render function – exactly like AddScreen
    const renderHeader = () => (
        <View style={s.redHeader}>
            <View style={{ paddingBottom: 10, paddingTop: insets.top + 10 }}>
                <View style={s.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
                        <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { fontWeight: '700' }]}>Edit Listing</Text>
                    <TouchableOpacity onPress={handleUpdate} style={s.iconButton}>
                        <Text style={[s.postBtnText, { fontWeight: '700' }]}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#FFF' }}>
                <ActivityIndicator size="large" color="#AF0B01" />
            </View>
        );
    }

    return (
        <View style={s.mainWrapper}>
            <StatusBar barStyle="light-content" backgroundColor="#AF0B01" />

            {renderHeader()}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={[s.formContainer, { paddingTop: 16 }]} showsVerticalScrollIndicator={false}>
                    <Text style={[s.label, { fontWeight: '700' }]}>Item Name</Text>
                    <TextInput style={s.input} value={name} onChangeText={setName} />

                    <Text style={s.label}>Category</Text>
                    <View style={s.chipGrid}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                style={[s.chip, { width: '31%' }, category === cat ? s.chipActive : s.chipInactive]}
                            >
                                <Text style={[s.chipText, category === cat && s.chipTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>Price (₱)</Text>
                    <TextInput style={s.input} keyboardType="numeric" value={price} onChangeText={setPrice} />

                    <Text style={s.label}>Rental Duration</Text>
                    <View style={s.chipGrid}>
                        {durationOptions.map((dur) => (
                            <TouchableOpacity
                                key={dur}
                                onPress={() => setRentalPeriod(dur)}
                                style={[s.chip, { width: '22%' }, rentalPeriod === dur ? s.chipActive : s.chipInactive]}
                            >
                                <Text style={[s.chipText, rentalPeriod === dur && s.chipTextActive]}>{dur}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>Location</Text>
                    <TextInput style={s.input} value={location} onChangeText={setLocation} />

                    <Text style={s.label}>Status</Text>
                    <View style={s.chipGrid}>
                        {statusOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                onPress={() => setStatus(opt)}
                                style={[s.chip, { width: '31%' }, status === opt ? s.chipActiveBlack : s.chipInactive]}
                            >
                                <Text style={[s.chipText, status === opt && s.chipTextActive]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>Description</Text>
                    <TextInput style={[s.input, s.textArea]} multiline numberOfLines={4} value={description} onChangeText={setDescription} />

                    <Text style={s.label}>Item Image</Text>
                    <TouchableOpacity style={s.imageButton} onPress={pickImage}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={s.imagePreview} />
                        ) : (
                            <View style={s.imagePlaceholder}>
                                <Ionicons name="camera-outline" size={24} color="#AF0B01" />
                                <Text style={s.imageButtonText}>Change Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}