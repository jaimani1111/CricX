package com.crickx.turf;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TurfService {

    private final TurfRepository turfRepository;

    public Turf createTurf(Turf turf) {
        if (turf.getManuallyBlockedSlots() == null) {
            turf.setManuallyBlockedSlots(new java.util.ArrayList<>());
        }
        return turfRepository.save(turf);
    }

    public List<Turf> getOwnerTurfs(String ownerId) {
        return turfRepository.findByOwnerId(ownerId);
    }

    public Turf blockSlot(String turfId, Turf.BlockedSlot slot) {
        Turf turf = turfRepository.findById(turfId)
                .orElseThrow(() -> new RuntimeException("Turf not found"));
        if (turf.getManuallyBlockedSlots() == null) {
            turf.setManuallyBlockedSlots(new java.util.ArrayList<>());
        }
        turf.getManuallyBlockedSlots().add(slot);
        return turfRepository.save(turf);
    }

    public Turf updateTurf(String turfId, Turf updatedTurf) {
        Turf turf = turfRepository.findById(turfId)
                .orElseThrow(() -> new RuntimeException("Turf not found"));
        
        turf.setName(updatedTurf.getName());
        turf.setAddress(updatedTurf.getAddress());
        turf.setDistrict(updatedTurf.getDistrict());
        turf.setCity(updatedTurf.getCity());
        turf.setState(updatedTurf.getState());
        turf.setPincode(updatedTurf.getPincode());
        turf.setPhone(updatedTurf.getPhone());
        turf.setWebsite(updatedTurf.getWebsite());
        turf.setBasePricePerHour(updatedTurf.getBasePricePerHour());
        turf.setAvailableSports(updatedTurf.getAvailableSports());
        turf.setFacilities(updatedTurf.getFacilities());
        turf.setOpeningTime(updatedTurf.getOpeningTime());
        turf.setClosingTime(updatedTurf.getClosingTime());
        turf.setDaysOpen(updatedTurf.getDaysOpen());
        turf.setPitchType(updatedTurf.getPitchType());
        turf.setCourtCount(updatedTurf.getCourtCount());
        turf.setActive(updatedTurf.isActive());
        
        return turfRepository.save(turf);
    }

    public List<Turf> getAllTurfs() {
        return turfRepository.findAll();
    }

    public List<Turf> findNearby(double lng, double lat, double radiusKm) {
        // Simple implementation for now, can be optimized with Mongo distance query
        return turfRepository.findAll(); // Placeholder logic
    }

    public Turf getTurfById(String id) {
        return turfRepository.findById(id).orElseThrow(() -> new RuntimeException("Turf not found"));
    }
}
