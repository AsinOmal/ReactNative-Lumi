import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
// Card width is half the screen minus side gutters and the inter-card gap.
// Wider gutters + a larger gap keep the grid at 2-per-row but visibly smaller —
// breathing room around each card reads as "tappable", not "edge-to-edge".
const CARD_GAP = 18;
const SIDE_PAD = 32;
const CARD_WIDTH = (width - SIDE_PAD * 2 - CARD_GAP) / 2;

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  // Cream veil over the wood-textured body bg so dark text on the card chips
  // stays legible. Matches the ImageBackdrop veil used by Library/Playground.
  bodyVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  // Header mirrors LibraryScreen / PlaygroundScreen: cloudy panorama bg,
  // rounded bottom corners, title block on the left + scene hero art on the
  // right. Back button is absolutely positioned in the top-left so the
  // title block stays vertically centred with the icon.
  header: {
    paddingHorizontal: 28,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  // `top` is set inline using safe-area insets so the button always sits
  // below the status bar; here we only pin the rest of its frame.
  backBtn: {
    position: 'absolute',
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,138,74,0.55)',
    zIndex: 2,
  },
  titleBlock: { flex: 1, paddingRight: 8, paddingTop: 12 },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 44,
    color: colors.textDark,
    lineHeight: 50,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 18,
    color: colors.textMid,
  },
  headerIcon: { width: 140, height: 140 },

  scroll: {
    paddingHorizontal: SIDE_PAD,
    paddingTop: 20,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C48A4A',
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardImage: {
    width: '92%',
    height: '92%',
  },
  cardName: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 16,
    color: '#3D2008',
    textAlign: 'center',
    marginBottom: 6,
  },
  // Single info chip replacing the previous per-ingredient chip row — the
  // kid doesn't need to read every word at the picker; that's what the
  // cooking screen is for.
  cardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#EFE2C9',
  },
  cardChipText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 11,
    color: '#7A4A1F',
  },
  cardLocked: { opacity: 0.75 },
  cardLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,10,5,0.72)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  cardLockLabel: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 12,
    color: '#FFF',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  cardFallbackEmoji: { fontSize: 44 },
});
