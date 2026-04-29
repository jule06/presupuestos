package com.proyectopresupuesto.presupuesto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

public class EstadisticasDTO {

    private final BigDecimal promedioCostoM2;
    private final BigDecimal minCostoM2;
    private final BigDecimal maxCostoM2;
    private final long totalRegistros;
    private BigDecimal medianaCostoM2;
    private Map<String, Long> distribucionPorTipo;
    private Map<String, Long> distribucionPorCategoria;

    public EstadisticasDTO(Double promedio, BigDecimal min, BigDecimal max, Long total) {
        this.promedioCostoM2 = promedio != null
                ? BigDecimal.valueOf(promedio).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        this.minCostoM2 = min != null ? min : BigDecimal.ZERO;
        this.maxCostoM2 = max != null ? max : BigDecimal.ZERO;
        this.totalRegistros = total != null ? total : 0;
    }

    public static BigDecimal calcularMediana(List<BigDecimal> valores) {
        if (valores == null || valores.isEmpty()) return BigDecimal.ZERO;
        int n = valores.size();
        if (n % 2 == 1) return valores.get(n / 2);
        return valores.get(n / 2 - 1).add(valores.get(n / 2))
                .divide(BigDecimal.TWO, 2, RoundingMode.HALF_UP);
    }

    public BigDecimal getPromedioCostoM2() { return promedioCostoM2; }
    public BigDecimal getMinCostoM2() { return minCostoM2; }
    public BigDecimal getMaxCostoM2() { return maxCostoM2; }
    public long getTotalRegistros() { return totalRegistros; }
    public BigDecimal getMedianaCostoM2() { return medianaCostoM2; }
    public Map<String, Long> getDistribucionPorTipo() { return distribucionPorTipo; }
    public Map<String, Long> getDistribucionPorCategoria() { return distribucionPorCategoria; }

    public void setMedianaCostoM2(BigDecimal v) { this.medianaCostoM2 = v; }
    public void setDistribucionPorTipo(Map<String, Long> v) { this.distribucionPorTipo = v; }
    public void setDistribucionPorCategoria(Map<String, Long> v) { this.distribucionPorCategoria = v; }
}
