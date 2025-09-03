import { StyleSheet } from 'react-native';

const PRIMARY_COLOR = '#07bbfd';

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  accionButtonConfirmar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4caf50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'blacl',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'black',
    opacity: 0.9,
    marginTop: 4,
  },
  filtroPickerContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  filtroSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filtroSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtroLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginRight: 10,
  },
  filtroValueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filtroValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtroModalContainer: {
    width: '80%',
  },
  filtroModalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 5,
  },
  filtroModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtroModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  filtroModalOptionSelected: {
    backgroundColor: 'rgba(7, 187, 253, 0.05)',
  },
  optionColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  filtroModalItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  filtroModalItemTextSelected: {
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  reservaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reservaCardSelected: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modeloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeloInfo: {
    marginLeft: 10,
  },
  modeloNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  modeloCodigo: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
  },
  estadoText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  fechasContainer: {
    marginTop: 4,
  },
  fechaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fechaTexto: {
    fontSize: 13,
    color: '#444',
    marginLeft: 6,
  },
  detallesContainer: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  detallesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 8,
  },
  detallesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detallesTexto: {
    fontSize: 13,
    color: '#444',
    marginLeft: 6,
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap:5,
  },
  accionButtonCancelar: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  accionButtonVer: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  accionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 15,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  detallesModalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  detallesModalHeader: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detallesModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  detallesModalContent: {
    paddingVertical: 20,
    maxHeight: '80%',
  },
  detallesModalEstadoContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  estadoBadgeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
  },
  estadoTextLarge: {
    fontSize: 16,
    fontWeight: '700',
  },
  detallesModalSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detallesModalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detallesModalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  detallesModalRow: {
    marginBottom: 8,
  },
  detalleModalItem: {
    flexDirection: 'column',
  },
  detalleModalLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  detalleModalValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  modeloContainerModal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeloInfoModal: {
    marginLeft: 12,
  },
  modeloNombreModal: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  modeloCodigoModal: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  detallesModalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  detallesModalCloseButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  detallesModalCloseButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // NUEVOS ESTILOS AGREGADOS
  modeloEstadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modeloNombre: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginRight: 10,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    maxWidth: 90,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_COLOR,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    flexShrink: 1,
  },
});

export default styles;
