import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useT } from '../../i18n';

const CAPTION_LIMIT = 100;

interface FeedCardCaptionProps {
  username: string;
  caption?: string;
  displayTime: string;
  styles: any;
}

export const FeedCardCaption: React.FC<FeedCardCaptionProps> = React.memo(({
  username,
  caption = '',
  displayTime,
  styles,
}) => {
  const { t } = useT();
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongCaption = caption.length > CAPTION_LIMIT;
  const displayedCaption = isLongCaption && !isExpanded
    ? `${caption.substring(0, CAPTION_LIMIT)}...`
    : caption;

  return (
    <View style={styles.captionContainer}>
      <Text style={styles.caption}>
        <Text style={styles.captionUsername}>{username} </Text>
        {displayedCaption}
        {isLongCaption && (
          <Text
            style={styles.seeMore}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            {' '}{isExpanded ? t('feed.seeLess') : t('feed.seeMore')}
          </Text>
        )}
      </Text>
      <Text style={styles.timeAgo}>{displayTime}</Text>
    </View>
  );
});
