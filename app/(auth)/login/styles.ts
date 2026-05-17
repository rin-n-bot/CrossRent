import { Dimensions, PixelRatio, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');


// Adaptive scaling functions based on design dimensions (390x844)
const scaleW = (size: number) => (width / 390) * size;
const scaleH = (size: number) => (height / 844) * size;
const scale = (size: number) => Math.round(PixelRatio.roundToNearestPixel(scaleW(size)));


// Shared input styles for consistency
const SHARED_INPUT = {
  backgroundColor: '#ffffff',
  borderRadius: scale(15),
  height: scaleH(60),
  paddingHorizontal: scale(20),
  borderWidth: 1.5,
  borderColor: '#ffffff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 2,
  elevation: 0,
};


// Styles
export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inner: {
    flex: 1,
    paddingHorizontal: scale(30),
    justifyContent: 'flex-start',
    paddingBottom: scaleH(30),
  },


  // Header and text styles
  header: {
    alignItems: 'flex-start',
    marginBottom: scaleH(10),
  },
  logo: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#222D31',
    letterSpacing: -0.5,
    marginBottom: scaleH(8),
  },
  heroHeader: {
    fontSize: scale(35),
    fontWeight: '700',
    color: '#222D31',
    letterSpacing: -1.5,
  },
  quote: {
    fontSize: scale(13),
    textAlign: 'left',
    color: '#999',
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: scale(18),
  },


  // Input form styles
  form: {
    width: '100%',
  },
  inputBox: {
    marginBottom: scaleH(25),
    position: 'relative',
  },
  labelWrapper: {
    position: 'absolute',
    top: -10,
    left: scale(15),
    backgroundColor: '#f5f5f5',
    paddingHorizontal: scale(5),
    zIndex: 1,
  },
  inputLabel: {
    fontSize: scale(11),
    fontWeight: '700',
    color: '#222D31',
  },
  input: {
    ...SHARED_INPUT,
    fontSize: scale(16),
    color: '#1D3557',
  },
  passwordInputContainer: {
    ...SHARED_INPUT,
    flexDirection: 'row',
    alignItems: 'center',
  },


  // Button styles
  mainActionBtn: {
    backgroundColor: '#AF0B01',
    height: scaleH(60),
    borderRadius: scale(15),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleH(10),
    elevation: 3,
    shadowColor: '#AF0B01',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  mainActionText: {
    color: '#FFFFFF',
    fontSize: scale(16),
    fontWeight: '600',
    letterSpacing: 1,
  },
  forgotBtn: {
    marginTop: scaleH(20),
    alignItems: 'center',
  },
  forgotText: {
    color: '#1d3557',
    fontSize: scale(14),
    fontWeight: '600',
  },
  footerLogoContainer: {
    alignItems: 'center',
    marginTop: scaleH(30),
  },
  footerLogo: {
    width: scale(45),
    height: scale(45),
    resizeMode: 'contain',
    opacity: 0.6,
  },
  
});