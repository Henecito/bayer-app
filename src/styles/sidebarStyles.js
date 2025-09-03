import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
export const SIDEBAR_WIDTH = Math.max(Math.min(width * 0.65, 270), 220);

const sidebarStyles = StyleSheet.create({
  SIDEBAR_WIDTH,
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingTop: 70,
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 6,
  },
  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 9,
  },
  logo: {
    width: "100%",
    height: 110,
    marginBottom: 40,
    marginTop: 30,
  },
  menuTitle: {
    marginBottom: 10,
  },
  sectionContainer: {
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subMenu: {
    marginTop: 6,
  },
  subItemContainer: {
    paddingVertical: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    marginVertical: 4,
    paddingLeft: 12,
  },
  userCard: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "#05bcf9",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    color: "#fff",
    fontWeight: "bold",
  },
  userRole: {
    color: "#e8f9ff",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 6,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    backgroundColor: "#05bcf9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: {
    color: "black",
  },
});

export default sidebarStyles;