package com.equityportal.persistence.repository;

import com.equityportal.persistence.entity.AssetClass;
import com.equityportal.persistence.entity.Instrument;
import com.equityportal.persistence.entity.RegionalPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstrumentRepository extends JpaRepository<Instrument, UUID> {

    Optional<Instrument> findByTicker(String ticker);

    List<Instrument> findByAssetClass(AssetClass assetClass);

    List<Instrument> findByRegion(RegionalPreference region);

    List<Instrument> findByAssetClassAndRegion(AssetClass assetClass, RegionalPreference region);
}
