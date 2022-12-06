import React from "react";
import { FormattedMessage } from "react-intl";
import { useAsyncFn } from "react-use";

import { ControlLabels } from "components";
import { Card } from "components/ui/Card";
import { Switch } from "components/ui/Switch";

import { useConnectionEditService } from "hooks/services/ConnectionEdit/ConnectionEditService";

import styles from "./SchemaUpdateNotifications.module.scss";

export const SchemaUpdateNotifications: React.FC = () => {
  const { connection, updateConnection, connectionUpdating } = useConnectionEditService();
  const [{ loading }, onChange] = useAsyncFn(async (checked: boolean) => {
    await updateConnection({
      connectionId: connection.connectionId,
      notifySchemaChanges: checked,
    });
  });

  return (
    <Card withPadding className={styles.container}>
      <ControlLabels
        nextLine
        label={<FormattedMessage id="connection.schemaUpdateNotifications.title" />}
        message={<FormattedMessage id="connection.schemaUpdateNotifications.info" />}
      />
      <Switch
        checked={connection.notifySchemaChanges}
        onChange={(event) => onChange(event.target.checked)}
        disabled={connectionUpdating}
        loading={loading}
      />
    </Card>
  );
};
