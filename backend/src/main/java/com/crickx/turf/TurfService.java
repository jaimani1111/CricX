package com.crickx.turf;

import com.crickx.message.MessageService;
import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TurfService {

    private final TurfRepository turfRepository;
    private final MessageService messageService;

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

    public Turf bookPlayerSlot(String turfId, Turf.BlockedSlot slot, User user) {
        Turf turf = getTurfById(turfId);
        
        slot.setBookedByUserId(user.getId());
        slot.setBookedByUserName(user.getName());
        slot.setBookedByUserPhone(user.getPhone() != null ? user.getPhone() : "");
        slot.setStatus("APPROVED");
        if (slot.getReason() == null || slot.getReason().isBlank()) {
            slot.setReason("Player Booking: " + user.getName());
        }

        if (turf.getManuallyBlockedSlots() == null) {
            turf.setManuallyBlockedSlots(new java.util.ArrayList<>());
        }
        
        // Overlap verification
        for (Turf.BlockedSlot existing : turf.getManuallyBlockedSlots()) {
            if (existing.getDate().equals(slot.getDate())) {
                if (existing.getStartTime().equals(slot.getStartTime())) {
                    throw new RuntimeException("This slot is already booked!");
                }
            }
        }
        
        turf.getManuallyBlockedSlots().add(slot);
        Turf saved = turfRepository.save(turf);
        
        // Notify turf owner/admin via Chat!
        try {
            String notificationText = String.format(
                "System Booking Alert 🏟️: Player '%s' has booked a slot at your venue '%s' on %s from %s to %s.",
                user.getName(), turf.getName(), slot.getDate(), slot.getStartTime(), slot.getEndTime()
            );
            messageService.sendMessage(user.getId(), turf.getOwnerId(), notificationText);
        } catch (Exception e) {
            System.err.println("Failed to send booking notification chat: " + e.getMessage());
        }
        
        return saved;
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
        return turfRepository.findAll();
    }

    public Turf getTurfById(String id) {
        return turfRepository.findById(id).orElseThrow(() -> new RuntimeException("Turf not found"));
    }
}
