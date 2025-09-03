import { StyleSheet } from 'react-native';

// Colores consistentes con la app
export const COLORS = {
  primary: '#07bbfd',
  secondary: '#88d42b',
  white: '#ffffff',
  black: '#000000',
  lightGray: '#f8f9fa',
  darkGray: '#333333',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  shadow: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.6)',
};

export const GRADIENT_COLORS = ['#88d42b03', '#07bbfdd9'];
export const CARD_GRADIENT = ['#ffffff', '#f8f9fa'];

export const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.darkGray,
    fontSize: 16,
  },
  container: {
    flexGrow: 1,
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 38,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    elevation: 8,
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: 15,
  },
  hiText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: COLORS.black,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  infoCardSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 1,
  },
  trendContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 3,
  },
  valueText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '500',
    color: '#777',
    marginLeft: 3,
  },
  weatherDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  temperatureContainer: {
    alignItems: 'center',
  },
  temperatureText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  feelsLikeText: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  weatherStatsContainer: {
    alignItems: 'flex-end',
  },
  weatherStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  weatherStatText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 4,
    fontWeight: '500',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingHorizontal: 16,
  },
  quickAccessCard: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
    elevation: 4,
  },
  quickAccessText: {
    fontSize: 12,
    marginTop: 8,
    color: '#0077b6',
  },
  
  // Estilos para ubicación automática
  autoLocationIndicator: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  autoLocationButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  autoLocationButtonLoading: {
    backgroundColor: '#999',
  },
  autoLocationButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 12,
  },
  modalBody: {
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: COLORS.darkGray,
  },
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  cityButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 4,
  },
  cityButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  cityButtonText: {
    color: COLORS.darkGray,
    fontSize: 14,
    fontWeight: '500',
  },
  cityButtonTextSelected: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginLeft: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos del modal de confirmación
  logoutModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
logoutModalContainer: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  width: '85%',
},
logoutModalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 15,
},
logoutModalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-around',
},
logoutModalButton: {
  backgroundColor: '#05bcf9', // igual que modalButton
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  marginTop: 10,
},
logoutModalButtonText: {
  color: '#fff',
  fontSize: 16,
},
});