package com.equityportal.portfolio.service;

import com.equityportal.persistence.entity.AssetClass;
import com.equityportal.persistence.entity.Instrument;
import com.equityportal.persistence.entity.RegionalPreference;
import com.equityportal.persistence.repository.InstrumentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstrumentUniverseService {

    private final InstrumentRepository instrumentRepository;

    public InstrumentUniverseService(InstrumentRepository instrumentRepository) {
        this.instrumentRepository = instrumentRepository;
    }

    public List<Instrument> findByAssetClassAndRegion(AssetClass assetClass, RegionalPreference region) {
        return instrumentRepository.findByAssetClassAndRegion(assetClass, region);
    }

    public List<Instrument> findByAssetClass(AssetClass assetClass) {
        return instrumentRepository.findByAssetClass(assetClass);
    }

    public List<Instrument> findByRegion(RegionalPreference region) {
        return instrumentRepository.findByRegion(region);
    }
}
