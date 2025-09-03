import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

const PRIMARY_COLOR = "#07bbfd";
const SECONDARY_COLOR = "#045d99";

// Función para formatear fecha correctamente sin problemas de zona horaria
const formatDateCorrectly = (dateString) => {
  if (!dateString) return "";

  // Forzar interpretación como fecha local agregando T00:00:00
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Función para filtrar modelos según cantidad de litros
const getModelosDisponiblesPorLitros = (cantidadLitros, MODELOS_MAQUINAS) => {
  if (!cantidadLitros || !MODELOS_MAQUINAS) return [];

  const modelosPermitidos = {
    "0-35": ["Grazmec Vasitos"],
    "35-120": ["Grazmec MTS 120 Spray System"],
    "+120": ["Grazmec MTS 120 Spray System Nueva"],
  };

  const idsPermitidos = modelosPermitidos[cantidadLitros] || [];
  return MODELOS_MAQUINAS.filter((modelo) => idsPermitidos.includes(modelo.id));
};

// Función para verificar si una fecha es fin de semana (sábado o domingo)
const isWeekend = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// Función para obtener fechas deshabilitadas (fines de semana)
const getDisabledDates = (startDate, endDate) => {
  const disabled = {};
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split("T")[0];
    if (isWeekend(dateString)) {
      disabled[dateString] = {
        disabled: true,
        disableTouchEvent: true,
        textColor: "#c0c0c0",
      };
    }
  }

  return disabled;
};

export const renderStep1 = (cantidadLitros, setCantidadLitros, styles) => {
  return (
    <>
      <Ionicons
        name="water-outline"
        size={60}
        color={PRIMARY_COLOR}
        style={styles.stepIcon}
      />
      <Text style={styles.stepTitle}>¿Cuántos Kg de semilla compraste?</Text>
      <Text style={styles.stepDescription}>
        Selecciona el rango de Kg que compraste para esta reserva
      </Text>

      {[
        { label: "0-35 Kg", value: "0-35" },
        { label: "35-120 Kg", value: "35-120" },
        { label: "+120 Kg", value: "+120" },
      ].map((item) => (
        <TouchableOpacity
          key={item.value}
          style={[
            styles.machineCard,
            cantidadLitros === item.value && styles.machineCardSelected,
          ]}
          onPress={() => setCantidadLitros(item.value)}
        >
          <View style={styles.machineCardContent}>
            <Ionicons
              name="water"
              size={24}
              color={cantidadLitros === item.value ? "#fff" : PRIMARY_COLOR}
            />
            <Text
              style={[
                styles.machineCardTitle,
                cantidadLitros === item.value && styles.machineCardTextSelected,
                { marginLeft: 10 },
              ]}
            >
              {item.label}
            </Text>
            {cantidadLitros === item.value && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#fff"
                style={{ marginLeft: "auto" }}
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

export const renderStep2 = (
  fechaInicio,
  setFechaInicio,
  fechaMinISO,
  formatDate,
  styles,
  blockedStarts,
  blockedWeeks
) => {
  // Generar fechas deshabilitadas para los próximos 2 años
  const today = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(today.getFullYear() + 2);

  const disabledDates = getDisabledDates(
    today.toISOString().split("T")[0],
    twoYearsFromNow.toISOString().split("T")[0]
  );

  const bloqueadas = { ...disabledDates };

  // Bloquear días con 3 reservas iniciadas
  blockedStarts.forEach((date) => {
    bloqueadas[date] = {
      disabled: true,
      disableTouchEvent: true,
      textColor: "#999",
    };
  });

  // Bloquear semanas con 15 reservas iniciadas
  blockedWeeks.forEach((weekStart) => {
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const str = d.toISOString().split("T")[0];
      bloqueadas[str] = {
        disabled: true,
        disableTouchEvent: true,
        textColor: "#999",
      };
    }
  });

  return (
    <>
      <Ionicons
        name="calendar-outline"
        size={60}
        color={PRIMARY_COLOR}
        style={styles.stepIcon}
      />
      <Text style={styles.stepTitle}>Fecha de inicio</Text>
      <Text style={styles.stepDescription}>
        Selecciona la fecha en que necesitas comenzar a utilizar la maquinaria
      </Text>

      <Calendar
        minDate={fechaMinISO}
        onDayPress={(day) => {
          if (!isWeekend(day.dateString)) {
            setFechaInicio(day.dateString);
          }
        }}
        markedDates={{
          ...bloqueadas,
          ...(fechaInicio
            ? {
                [fechaInicio]: {
                  selected: true,
                  selectedColor: PRIMARY_COLOR,
                  selectedTextColor: "#fff",
                },
              }
            : {}),
        }}
        theme={{
          todayTextColor: PRIMARY_COLOR,
          arrowColor: PRIMARY_COLOR,
          selectedDayBackgroundColor: PRIMARY_COLOR,
          selectedDayTextColor: "#fff",
          monthTextColor: PRIMARY_COLOR,
          dayTextColor: "#222",
          textDayFontWeight: "500",
          textMonthFontWeight: "bold",
        }}
        style={styles.calendar}
      />

      {fechaInicio && (
        <View style={styles.dateConfirmation}>
          <Text style={styles.dateConfirmationText}>
            Fecha seleccionada: {formatDateCorrectly(fechaInicio)}
          </Text>
        </View>
      )}
    </>
  );
};

export const renderStep3 = (
  fechaInicio,
  fechaFin,
  setFechaFin,
  fechaMinISO,
  duracionReserva,
  formatDate,
  getDateRangeMarkers,
  styles,
  blockedEnds
) => {
  const today = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(today.getFullYear() + 2);

  const disabledDates = getDisabledDates(
    today.toISOString().split("T")[0],
    twoYearsFromNow.toISOString().split("T")[0]
  );

  blockedEnds.forEach((date) => {
    disabledDates[date] = {
      disabled: true,
      disableTouchEvent: true,
      textColor: "#999",
    };
  });

  return (
    <>
      <Ionicons
        name="calendar-outline"
        size={60}
        color={PRIMARY_COLOR}
        style={styles.stepIcon}
      />
      <Text style={styles.stepTitle}>Fecha de fin</Text>
      <Text style={styles.stepDescription}>
        Selecciona la fecha en que planeas devolver la maquinaria
      </Text>

      <View style={styles.dateReminderContainer}>
        <Ionicons name="information-circle" size={22} color={PRIMARY_COLOR} />
        <Text style={styles.dateReminderText}>
          Fecha de inicio: {formatDateCorrectly(fechaInicio)}
        </Text>
      </View>

      <Calendar
        minDate={fechaInicio || fechaMinISO}
        onDayPress={(day) => {
          if (!isWeekend(day.dateString)) {
            setFechaFin(day.dateString);
          }
        }}
        markedDates={{
          ...disabledDates,
          ...(fechaInicio
            ? {
                [fechaInicio]: {
                  selected: true,
                  selectedColor: PRIMARY_COLOR,
                  selectedTextColor: "#fff",
                },
              }
            : {}),
          ...(fechaFin
            ? {
                [fechaFin]: {
                  selected: true,
                  selectedColor: PRIMARY_COLOR,
                  selectedTextColor: "#fff",
                },
              }
            : {}),
          ...getDateRangeMarkers(),
        }}
        theme={{
          todayTextColor: PRIMARY_COLOR,
          arrowColor: PRIMARY_COLOR,
          selectedDayBackgroundColor: PRIMARY_COLOR,
          selectedDayTextColor: "#fff",
          monthTextColor: PRIMARY_COLOR,
          dayTextColor: "#222",
          textDayFontWeight: "500",
          textMonthFontWeight: "bold",
        }}
        style={styles.calendar}
      />

      {fechaFin && duracionReserva && (
        <View style={styles.dateConfirmation}>
          <Text style={styles.dateConfirmationText}>
            Duración de la reserva: {duracionReserva}{" "}
            {duracionReserva === 1 ? "día" : "días"}
          </Text>
        </View>
      )}
    </>
  );
};

export const renderStep4 = (
  MODELOS_MAQUINAS,
  modeloSeleccionado,
  setModeloSeleccionado,
  setCodigoSeleccionado,
  fechaInicio,
  fechaFin,
  duracionReserva,
  formatDate,
  cantidadLitros,
  styles
) => {
  const modelosDisponibles = getModelosDisponiblesPorLitros(
    cantidadLitros,
    MODELOS_MAQUINAS
  );

  return (
    <>
      <Ionicons
        name="construct-outline"
        size={60}
        color={PRIMARY_COLOR}
        style={styles.stepIcon}
      />
      <Text style={styles.stepTitle}>Tipo de maquinaria</Text>
      <Text style={styles.stepDescription}>
        Selecciona el modelo de máquina que corresponde para {cantidadLitros}{" "}
        litros
      </Text>

      <View style={styles.dateReminderContainer}>
        <Ionicons name="calendar" size={18} color={PRIMARY_COLOR} />
        <Text style={styles.dateReminderText}>
          Período: {formatDateCorrectly(fechaInicio)} -{" "}
          {formatDateCorrectly(fechaFin)} ({duracionReserva}{" "}
          {duracionReserva === 1 ? "día" : "días"})
        </Text>
      </View>

      {modelosDisponibles.length === 0 ? (
        <View style={styles.noMachinesContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.noMachinesText}>
            No hay máquinas disponibles para {cantidadLitros} litros
          </Text>
        </View>
      ) : (
        modelosDisponibles.map((modelo) => (
          <TouchableOpacity
            key={modelo.id}
            style={[
              styles.machineCard,
              modeloSeleccionado === modelo.id && styles.machineCardSelected,
            ]}
            onPress={() => {
              setModeloSeleccionado(modelo.id);
              setCodigoSeleccionado(null); // Reset código al cambiar de modelo
            }}
          >
            <View style={styles.machineCardContent}>
              <Ionicons
                name={modelo.icono}
                size={28}
                color={
                  modeloSeleccionado === modelo.id ? "#fff" : PRIMARY_COLOR
                }
              />
              <View style={styles.machineCardTextContainer}>
                <Text
                  style={[
                    styles.machineCardTitle,
                    modeloSeleccionado === modelo.id &&
                      styles.machineCardTextSelected,
                  ]}
                >
                  {modelo.nombre}
                </Text>
                <Text
                  style={[
                    styles.machineCardDescription,
                    modeloSeleccionado === modelo.id &&
                      styles.machineCardTextSelected,
                  ]}
                >
                  {modelo.descripcion}
                </Text>
                <Text
                  style={[
                    styles.machineCardCapacity,
                    modeloSeleccionado === modelo.id &&
                      styles.machineCardTextSelected,
                  ]}
                >
                  {modelo.capacidad}
                </Text>
              </View>
              {modeloSeleccionado === modelo.id && (
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </>
  );
};

export const renderStep5 = (
  MODELOS_MAQUINAS,
  MAQUINAS_DISPONIBLES,
  modeloSeleccionado,
  codigoSeleccionado,
  setCodigoSeleccionado,
  styles
) => {
  return (
    <>
      <Ionicons
        name="hardware-chip-outline"
        size={60}
        color={PRIMARY_COLOR}
        style={styles.stepIcon}
      />
      <Text style={styles.stepTitle}>Código de máquina</Text>
      <Text style={styles.stepDescription}>
        Selecciona la máquina específica que deseas reservar
      </Text>

      <View style={styles.dateReminderContainer}>
        <Ionicons name="construct" size={18} color={PRIMARY_COLOR} />
        <Text style={styles.dateReminderText}>
          Modelo seleccionado:{" "}
          {MODELOS_MAQUINAS.find((m) => m.id === modeloSeleccionado)?.nombre ||
            "-"}
        </Text>
      </View>

      {(MAQUINAS_DISPONIBLES[modeloSeleccionado] || []).length === 0 ? (
        <View style={styles.noMachinesContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.noMachinesText}>
            No hay códigos disponibles para las fechas seleccionadas.
          </Text>
        </View>
      ) : (
        MAQUINAS_DISPONIBLES[modeloSeleccionado].map((maquina) => (
          <TouchableOpacity
            key={maquina.codigo}
            style={[
              styles.codeCard,
              codigoSeleccionado === maquina.codigo && styles.codeCardSelected,
            ]}
            onPress={() => setCodigoSeleccionado(maquina.codigo)}
          >
            <View style={styles.codeCardContent}>
              <View style={styles.codeCardMainInfo}>
                <Text
                  style={[
                    styles.codeCardTitle,
                    codigoSeleccionado === maquina.codigo &&
                      styles.codeCardTextSelected,
                  ]}
                >
                  {maquina.codigo}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        maquina.estado === "Disponible" ? "#e6f7e6" : "#ffe6e6",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          maquina.estado === "Disponible"
                            ? "#2e7d32"
                            : "#c62828",
                      },
                    ]}
                  >
                    {maquina.estado}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </>
  );
};

export const renderStep6 = (
  MODELOS_MAQUINAS,
  modeloSeleccionado,
  codigoSeleccionado,
  fechaInicio,
  fechaFin,
  agricultorNombre,
  setAgricultorNombre,
  agricultorTelefono,
  setAgricultorTelefono,
  agricultorEmail,        // correo visible
  setAgricultorEmail,
  agricultorUbicacion,    // coords ocultas
  setAgricultorUbicacion,
  formatDate,
  styles,
  abrirModalMapa
) => {
  const handleTelefonoChange = (text) => {
    let filtered = text;

    if (filtered.startsWith("+")) {
      filtered = "+" + filtered.slice(1).replace(/[^0-9]/g, "");
    } else {
      filtered = filtered.replace(/[^0-9]/g, "");
    }

    if (filtered.length > 12) {
      filtered = filtered.slice(0, 12);
    }

    setAgricultorTelefono(filtered);
  };

  const handleEmailChange = (text) => {
    setAgricultorEmail(text);
  };

  const handleUbicacionSelect = (coords) => {
    // ✅ guarda coordenadas en el estado, pero no las mostramos en pantalla
    setAgricultorUbicacion(coords);
  };

  return (
    <>
      <Ionicons
        name="person-outline"
        size={60}
        color={PRIMARY_COLOR}
        style={styles.stepIcon}
      />
      <Text style={styles.stepTitle}>Datos de contacto agricultor</Text>
      <Text style={styles.stepDescription}>
        Proporciona los datos para completar la reserva
      </Text>

      <View style={styles.reservationSummary}>
        <View style={styles.summaryRow}>
          <Ionicons name="calendar" size={16} color={PRIMARY_COLOR} />
          <Text style={styles.summaryText}>
            {formatDateCorrectly(fechaInicio)} - {formatDateCorrectly(fechaFin)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="construct" size={16} color={PRIMARY_COLOR} />
          <Text style={styles.summaryText}>
            {MODELOS_MAQUINAS.find((m) => m.id === modeloSeleccionado)?.nombre}{" "}
            ({codigoSeleccionado})
          </Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Razon Social"
        value={agricultorNombre}
        onChangeText={(text) => {
          const filtered = text.replace(/[^a-zA-ZÀ-ÿñÑ\s]/g, "");
          setAgricultorNombre(filtered);
        }}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Número de teléfono"
        keyboardType="phone-pad"
        value={agricultorTelefono}
        onChangeText={handleTelefonoChange}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={agricultorEmail}
        onChangeText={handleEmailChange}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => abrirModalMapa(handleUbicacionSelect)}
      >
        <Ionicons name="location-outline" size={20} color="#fff" />
        <Text style={styles.mapButtonText}>
          Seleccionar ubicación en el mapa
        </Text>
      </TouchableOpacity>
    </>
  );
};


export const renderStep7 = (
  MODELOS_MAQUINAS,
  cantidadLitros,
  fechaInicio,
  fechaFin,
  duracionReserva,
  modeloSeleccionado,
  codigoSeleccionado,
  maquinaDetalles,
  agricultorNombre,
  agricultorTelefono,
  agricultorUbicacion,
  agricultorEmail, 
  formatDate,
  styles
) => {
  return (
    <>
      <Ionicons
        name="checkmark-done-outline"
        size={60}
        color={PRIMARY_COLOR}
        style={styles.stepIcon}
      />
      <Text style={styles.stepTitle}>Confirmación</Text>
      <Text style={styles.stepDescription}>
        Revisa los detalles de tu reserva antes de confirmar
      </Text>

      <View style={styles.confirmationBox}>
        {/* ... otras secciones ... */}

        <View style={styles.confirmationDivider} />

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationSectionTitle}>Datos de contacto</Text>
          <View style={styles.confirmRow}>
            <Ionicons name="person-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.confirmText}>
              Razón Social: {agricultorNombre}
            </Text>
          </View>
          <View style={styles.confirmRow}>
            <Ionicons name="call-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.confirmText}>
              Teléfono: {agricultorTelefono}
            </Text>
          </View>
          <View style={styles.confirmRow}>
            <Ionicons name="mail-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.confirmText}>
              Email: {agricultorEmail} {/* <-- agregado */}
            </Text>
          </View>
          <View style={styles.confirmRow}>
            <Ionicons name="location-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.confirmText}>
              Ubicación: {agricultorUbicacion}
            </Text>
          </View>
        </View>

        <View style={styles.policySection}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={SECONDARY_COLOR}
          />
          <Text style={styles.policyText}>
            Al confirmar esta reserva, aceptas los términos y condiciones de
            alquiler de maquinaria agrícola.
          </Text>
        </View>
      </View>
    </>
  );
};
